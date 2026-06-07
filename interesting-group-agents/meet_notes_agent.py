"""
Google Meet Notes Agent
Reads Google Meet transcripts/notes from Google Drive and generates:
  1. A follow-up email draft (in Burke's style) → saved to Gmail Drafts
  2. A HubSpot CRM note with meeting summary + action items
  3. Console output for review before anything is sent

Google Meet saves notes to Drive as Google Docs automatically.
This agent finds the most recent Meet notes doc and processes it.

Setup (one-time):
  Run: python meet_notes_agent.py --setup
  This re-runs the OAuth flow with Drive read scope added.

Usage:
  python meet_notes_agent.py --latest          # process most recent Meet notes
  python meet_notes_agent.py --list            # list recent Meet notes docs
  python meet_notes_agent.py --file <doc_id>   # process a specific doc by ID
"""

import os
import re
import json
import base64
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

CREDENTIALS_FILE = Path(__file__).parent / "gmail_credentials.json"
TOKEN_FILE       = Path(__file__).parent / "gmail_token.json"

# Drive scope added alongside existing Gmail scopes
SCOPES = [
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/drive.readonly",          # read Meet notes
    "https://www.googleapis.com/auth/documents.readonly",      # read Doc content
]


def _get_services():
    """Authenticate and return (drive_service, docs_service, gmail_service)."""
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build

    creds = None
    if TOKEN_FILE.exists():
        with open(TOKEN_FILE) as f:
            token_data = json.load(f)
        creds = Credentials.from_authorized_user_info(token_data, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_FILE), SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, "w") as f:
            f.write(creds.to_json())

    drive  = build("drive",     "v3", credentials=creds)
    docs   = build("docs",      "v1", credentials=creds)
    gmail  = build("gmail",     "v1", credentials=creds)
    return drive, docs, gmail


def list_meet_notes(limit: int = 10) -> list:
    """
    Find recent Google Meet notes docs in Drive.
    Meet saves notes as Docs with 'Meeting notes' in the title.
    Returns list of {id, name, created_time, modified_time}.
    """
    drive, _, _ = _get_services()

    results = drive.files().list(
        q="mimeType='application/vnd.google-apps.document' and (name contains 'Meeting notes' or name contains 'meet')",
        orderBy="modifiedTime desc",
        pageSize=limit,
        fields="files(id, name, createdTime, modifiedTime)",
    ).execute()

    files = results.get("files", [])
    return [
        {
            "id":            f["id"],
            "name":          f["name"],
            "created_time":  f.get("createdTime", ""),
            "modified_time": f.get("modifiedTime", ""),
        }
        for f in files
    ]


def read_doc_text(doc_id: str) -> str:
    """Read full text content from a Google Doc."""
    _, docs, _ = _get_services()
    doc = docs.documents().get(documentId=doc_id).execute()

    text_parts = []
    for element in doc.get("body", {}).get("content", []):
        paragraph = element.get("paragraph")
        if not paragraph:
            continue
        for elem in paragraph.get("elements", []):
            text_run = elem.get("textRun")
            if text_run:
                text_parts.append(text_run.get("content", ""))

    return "".join(text_parts)


def _extract_prospect_name(doc_text: str, doc_name: str) -> tuple:
    """
    Best-effort extraction of prospect first name and company from notes.
    Returns (first_name, company, to_email).
    """
    first_name = ""
    company    = ""
    to_email   = ""

    # Look for email addresses in the doc
    emails = re.findall(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", doc_text)
    # Filter out Burke's own emails
    external = [e for e in emails if "theinterestinggroup" not in e and "burke.ruder" not in e]
    if external:
        to_email = external[0]
        # Try to extract name from email (firstname.lastname@company.com)
        local = to_email.split("@")[0]
        parts = re.split(r"[._]", local)
        if parts:
            first_name = parts[0].capitalize()
        company_domain = to_email.split("@")[1].split(".")[0].capitalize()
        company = company_domain

    # Look for explicit name mentions: "Meeting with John Smith" or "Call with Jane"
    name_match = re.search(r"(?:meeting|call|with|intro)\s+(?:with\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)", doc_text, re.IGNORECASE)
    if name_match:
        full = name_match.group(1).strip()
        first_name = full.split()[0] if full else first_name

    return first_name, company, to_email


def generate_follow_up(doc_text: str, first_name: str = "", company: str = "") -> dict:
    """
    Analyze meeting notes and generate:
      - subject: follow-up email subject line
      - body: follow-up email body (Burke's style — brief, single CTA, no fluff)
      - crm_note: summary for HubSpot
      - action_items: list of next steps extracted from notes

    This is rule-based pattern matching. For richer AI-generated follow-ups,
    this function can be extended to call the Claude API.
    """
    text_lower = doc_text.lower()
    name = first_name or "there"

    # Extract action items (lines with "action", "follow up", "send", "schedule", todo markers)
    action_patterns = [
        r"(?:action item|next step|follow.?up|todo|to.do|will send|i'll|burke will|they will)[^\n.]*",
        r"(?:^|\n)\s*[-•*]\s*[^\n]+(?:send|schedule|share|connect|demo|proposal)[^\n]*",
    ]
    action_items = []
    for pattern in action_patterns:
        matches = re.findall(pattern, doc_text, re.IGNORECASE)
        action_items.extend([m.strip() for m in matches if len(m.strip()) > 10])
    action_items = list(dict.fromkeys(action_items))[:5]  # dedupe, max 5

    # Detect meeting type signals
    is_discovery    = any(w in text_lower for w in ["discovery", "intro", "first call", "learn about"])
    is_demo         = any(w in text_lower for w in ["demo", "demonstration", "showed", "walkthrough"])
    is_proposal     = any(w in text_lower for w in ["proposal", "quote", "pricing", "budget"])
    has_next_call   = any(w in text_lower for w in ["next call", "follow-up call", "schedule", "calendar"])
    mentioned_pain  = any(w in text_lower for w in ["pain", "problem", "issue", "challenge", "currently"])

    # Build subject line
    if is_proposal:
        subject = f"Re: {company} proposal — next steps" if company else "Re: our conversation — next steps"
    elif is_demo:
        subject = f"Re: {company} demo — follow up" if company else "Re: demo follow up"
    else:
        subject = f"Re: our conversation" if not company else f"Re: {company} — follow up"

    # Build body (Burke's style: short, direct, one CTA, anticipates follow-ups)
    greeting = f"Hey {name}," if name != "there" else "Hey,"

    # Core body based on meeting type
    if is_proposal:
        core = (
            "Appreciate the time today. I'll get a proposal together based on what we discussed "
            "and have it to you by end of week."
        )
        cta = "If anything changes on your end in the meantime, just let me know."
    elif is_demo:
        core = (
            "Good conversation today. Based on what you showed me, "
            "I have a clear picture of where you are and what the right options look like."
        )
        cta = "I'll pull together a shortlist of the best fits and send it over this week. Any questions in the meantime, I'm here."
    elif is_discovery:
        core = (
            "Good talking through your situation today. "
            "Based on what you shared, I think there's a real opportunity to improve things."
        )
        cta = "Let me do some digging on the vendor side and come back to you with some options. I'll be in touch by end of week."
    else:
        core = "Good connecting today — appreciate the time."
        cta  = "I'll follow up with next steps shortly."

    # Add action items if found
    action_block = ""
    if action_items:
        action_block = "\n\nFrom my end:\n" + "\n".join(f"  • {a}" for a in action_items[:3])

    body = f"{greeting}\n\n{core}{action_block}\n\n{cta}\n\nBurke\nThe Interesting Group | burke@theinterestinggroup.com"

    # CRM note
    crm_note = f"📋 Meeting Notes — {datetime.now().strftime('%Y-%m-%d')}\n\n"
    if is_discovery:
        crm_note += "Type: Discovery / Intro call\n"
    elif is_demo:
        crm_note += "Type: Demo\n"
    elif is_proposal:
        crm_note += "Type: Proposal discussion\n"
    else:
        crm_note += "Type: Follow-up call\n"

    if action_items:
        crm_note += "\nAction items:\n" + "\n".join(f"  • {a}" for a in action_items)

    crm_note += f"\n\nRaw notes excerpt:\n{doc_text[:500]}..."

    return {
        "subject":      subject,
        "body":         body,
        "crm_note":     crm_note,
        "action_items": action_items,
    }


def process_latest_notes(dry_run: bool = True) -> dict:
    """
    Find the most recent Meet notes doc, generate follow-up, and optionally
    create a Gmail draft. Returns the generated content.

    dry_run=True  → print only, don't create draft
    dry_run=False → create Gmail draft for review
    """
    print("Looking for recent Meet notes...")
    docs_list = list_meet_notes(limit=5)

    if not docs_list:
        print("No Meet notes found in Drive.")
        return {}

    # Use most recent
    latest = docs_list[0]
    print(f"Found: {latest['name']}  ({latest['modified_time'][:10]})")

    doc_text = read_doc_text(latest["id"])
    if not doc_text.strip():
        print("Doc appears empty.")
        return {}

    first_name, company, to_email = _extract_prospect_name(doc_text, latest["name"])
    result = generate_follow_up(doc_text, first_name, company)

    print("\n" + "=" * 60)
    print("GENERATED FOLLOW-UP")
    print("=" * 60)
    print(f"To:      {to_email or '(could not detect — fill in manually)'}")
    print(f"Subject: {result['subject']}")
    print(f"\nBody:\n{result['body']}")
    if result["action_items"]:
        print(f"\nAction items detected:\n" + "\n".join(f"  • {a}" for a in result["action_items"]))
    print("=" * 60)

    if not dry_run and to_email:
        from gmail_agent import create_draft
        draft_id = create_draft(
            to_email=to_email,
            subject=result["subject"],
            body=result["body"],
        )
        print(f"\n✓ Draft created in Gmail (ID: {draft_id})")
        print("  → Review at mail.google.com → Drafts before sending")
        result["gmail_draft_id"] = draft_id
    elif not dry_run and not to_email:
        print("\n⚠ Could not detect recipient email — open Gmail Drafts and add manually")
        from gmail_agent import create_draft
        draft_id = create_draft(
            to_email="",
            subject=result["subject"],
            body=result["body"],
        )
        result["gmail_draft_id"] = draft_id

    result["doc_id"]     = latest["id"]
    result["doc_name"]   = latest["name"]
    result["first_name"] = first_name
    result["company"]    = company
    result["to_email"]   = to_email
    return result


def process_doc(doc_id: str, dry_run: bool = True) -> dict:
    """Process a specific Meet notes doc by ID."""
    print(f"Reading doc {doc_id}...")
    doc_text = read_doc_text(doc_id)
    first_name, company, to_email = _extract_prospect_name(doc_text, doc_id)
    result = generate_follow_up(doc_text, first_name, company)

    print(f"\nTo:      {to_email or '(fill in manually)'}")
    print(f"Subject: {result['subject']}")
    print(f"\n{result['body']}")

    if not dry_run:
        from gmail_agent import create_draft
        draft_id = create_draft(
            to_email=to_email or "",
            subject=result["subject"],
            body=result["body"],
        )
        print(f"\n✓ Draft created: {draft_id}")
        result["gmail_draft_id"] = draft_id

    return result


if __name__ == "__main__":
    import sys

    if "--setup" in sys.argv:
        print("Re-running OAuth to add Google Drive scope...")
        print("A browser window will open — approve both Gmail and Drive access.")
        # Delete existing token to force re-auth with new scopes
        if TOKEN_FILE.exists():
            TOKEN_FILE.unlink()
            print("Existing token cleared.")
        drive, docs, gmail = _get_services()
        profile = gmail.users().getProfile(userId="me").execute()
        print(f"\n✓ Connected as: {profile['emailAddress']}")
        print(f"✓ Drive access: enabled")
        print(f"Token saved to: {TOKEN_FILE}")

    elif "--list" in sys.argv:
        notes = list_meet_notes(limit=10)
        if not notes:
            print("No Meet notes found.")
        for n in notes:
            print(f"  {n['modified_time'][:10]}  {n['name']}  ({n['id']})")

    elif "--file" in sys.argv:
        idx = sys.argv.index("--file")
        doc_id = sys.argv[idx + 1] if idx + 1 < len(sys.argv) else None
        if not doc_id:
            print("Usage: python meet_notes_agent.py --file <doc_id>")
        else:
            send = "--send" in sys.argv
            process_doc(doc_id, dry_run=not send)

    elif "--latest" in sys.argv:
        send = "--send" in sys.argv
        process_latest_notes(dry_run=not send)

    else:
        print("Meet Notes Agent")
        print("")
        print("  --setup              Re-auth OAuth to add Drive scope (run once)")
        print("  --list               List recent Meet notes docs in Drive")
        print("  --latest             Preview follow-up from most recent notes")
        print("  --latest --send      Generate follow-up AND create Gmail draft")
        print("  --file <doc_id>      Process a specific doc")
        print("  --file <id> --send   Process + create Gmail draft")
        print("")
        print("Workflow:")
        print("  1. Finish a Meet call")
        print("  2. Run: python meet_notes_agent.py --latest --send")
        print("  3. Review draft in Gmail → hit Send")
