"""
Gmail Agent
Creates draft emails in Gmail for review before sending.
Monitors replies and triggers HubSpot deal stage updates.

Setup (one-time):
  1. Go to console.cloud.google.com
  2. Create project → Enable Gmail API
  3. OAuth consent screen (External) → add your email as test user
  4. Credentials → OAuth client ID → Desktop app → Download JSON
  5. Save as ~/interesting-group-agents/gmail_credentials.json
  6. Run: python3 gmail_agent.py --setup
     This opens a browser for OAuth consent and saves gmail_token.json
"""

import os
import base64
import json
import pickle
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path

CREDENTIALS_FILE = Path(__file__).parent / "gmail_credentials.json"
TOKEN_FILE = Path(__file__).parent / "gmail_token.json"
SCOPES = [
    "https://www.googleapis.com/auth/gmail.compose",   # create drafts
    "https://www.googleapis.com/auth/gmail.send",      # send emails
    "https://www.googleapis.com/auth/gmail.readonly",  # read inbox for replies
    "https://www.googleapis.com/auth/gmail.modify",    # mark as read
]
# Used only for tokens that also need to write to a Google Calendar
# (currently just burke.ruder@gmail.com's personal token).
CALENDAR_SCOPES = SCOPES + ["https://www.googleapis.com/auth/calendar"]


def _get_credentials(credentials_path: Path = None, token_path: Path = None, scopes: list = None):
    """Load/refresh OAuth credentials for an account, requesting `scopes`
    (defaults to SCOPES). Shared by _get_gmail_service and calendar_agent.py
    so both APIs can be authenticated from the same token file.
    """
    try:
        from google.oauth2.credentials import Credentials
        from google.auth.transport.requests import Request
        from google_auth_oauthlib.flow import InstalledAppFlow
    except ImportError:
        raise ImportError(
            "Gmail dependencies not installed. Run:\n"
            "  pip3 install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client"
        )

    requested_scopes = scopes or SCOPES
    credentials_file = Path(credentials_path) if credentials_path else CREDENTIALS_FILE
    token_file = Path(token_path) if token_path else TOKEN_FILE

    creds = None

    if token_file.exists():
        with open(token_file, "r") as f:
            token_data = json.load(f)
        creds = Credentials.from_authorized_user_info(token_data, requested_scopes)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not credentials_file.exists():
                raise FileNotFoundError(
                    f"Gmail credentials not found at {credentials_file}\n"
                    "Follow the setup instructions in gmail_agent.py"
                )
            flow = InstalledAppFlow.from_client_secrets_file(str(credentials_file), requested_scopes)
            creds = flow.run_local_server(port=0)

        with open(token_file, "w") as f:
            f.write(creds.to_json())

    return creds


def _get_gmail_service(credentials_path: Path = None, token_path: Path = None):
    """Authenticate and return a Gmail API service object.

    Pass credentials_path/token_path to authenticate a different account
    (e.g. a personal Gmail) without touching the default TIG credentials.
    """
    from googleapiclient.discovery import build

    creds = _get_credentials(credentials_path, token_path)
    return build("gmail", "v1", credentials=creds)


def create_draft(to_email: str, subject: str, body: str, prospect_name: str = "") -> str:
    """
    Create a Gmail draft. Returns the draft ID.
    The email is NOT sent — Burke reviews and sends manually.
    """
    service = _get_gmail_service()

    message = MIMEMultipart()
    message["to"] = to_email
    message["subject"] = subject
    message.attach(MIMEText(body, "plain"))

    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    draft = service.users().drafts().create(
        userId="me",
        body={"message": {"raw": raw}},
    ).execute()

    return draft["id"]


def create_drafts_for_prospects(prospects: list) -> list:
    """
    Create Gmail drafts for all A-tier prospects that have a revealed email.
    Returns prospects list with gmail_draft_id added where applicable.
    """
    service = _get_gmail_service()
    results = []
    drafted = 0
    skipped = 0

    print("\nCreating Gmail drafts...")

    for prospect in prospects:
        email = prospect.get("email")
        outreach = prospect.get("outreach", {})

        if not email or not outreach:
            skipped += 1
            results.append(prospect)
            continue

        try:
            draft_id = create_draft(
                to_email=email,
                subject=outreach.get("subject", ""),
                body=outreach.get("body", ""),
                prospect_name=prospect.get("first_name", ""),
            )
            print(f"  ✓ Draft created: {prospect.get('first_name')} @ {prospect.get('company')}")
            drafted += 1
            results.append({**prospect, "gmail_draft_id": draft_id})

        except Exception as e:
            print(f"  ✗ Draft failed for {prospect.get('first_name')}: {e}")
            results.append(prospect)

    print(f"\nGmail drafts: {drafted} created, {skipped} skipped (no email address)")
    print("Review and send drafts at mail.google.com → Drafts")
    return results


def _extract_body(payload: dict) -> str:
    """Recursively extract plain text body from a Gmail message payload."""
    if payload.get("mimeType") == "text/plain":
        data = payload.get("body", {}).get("data", "")
        if data:
            return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")
    for part in payload.get("parts", []):
        result = _extract_body(part)
        if result:
            return result
    return ""


def check_replies(since_days: int = 2) -> list:
    """
    Check inbox for unread replies from prospects.
    Returns list of reply dicts including full body text for classification.
    """
    service = _get_gmail_service()

    results = service.users().messages().list(
        userId="me",
        q=f"in:inbox is:unread newer_than:{since_days}d",
        maxResults=50,
    ).execute()

    messages = results.get("messages", [])
    replies = []

    for msg in messages:
        detail = service.users().messages().get(
            userId="me",
            id=msg["id"],
            format="full",
        ).execute()

        payload = detail.get("payload", {})
        headers = {h["name"]: h["value"] for h in payload.get("headers", [])}
        body = _extract_body(payload)

        replies.append({
            "message_id": msg["id"],
            "thread_id": detail.get("threadId"),
            "from": headers.get("From", ""),
            "subject": headers.get("Subject", ""),
            "date": headers.get("Date", ""),
            "snippet": detail.get("snippet", ""),
            "body": body,
        })

    return replies


def create_threaded_draft(to_email: str, subject: str, body: str, thread_id: str, service=None) -> str:
    """
    Create a Gmail draft as a reply in an existing thread.
    Returns draft ID. Pass an already-authenticated `service` to target a
    non-default account (e.g. a personal Gmail) instead of the TIG default.
    """
    if service is None:
        service = _get_gmail_service()

    message = MIMEMultipart()
    message["to"] = to_email
    message["subject"] = subject
    message.attach(MIMEText(body, "plain"))

    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    draft = service.users().drafts().create(
        userId="me",
        body={"message": {"raw": raw, "threadId": thread_id}},
    ).execute()

    return draft["id"]


if __name__ == "__main__":
    import sys

    if "--setup" in sys.argv:
        # Optional overrides so a second account (e.g. personal Gmail) can be
        # authorized without clobbering the default gmail_token.json:
        #   python3 gmail_agent.py --setup --credentials gmail_credentials_personal.json --token gmail_token_personal.json
        # Add --calendar to also request Calendar API scope (needed only for
        # the token that writes to the Family Events calendar).
        def _arg_after(flag):
            return sys.argv[sys.argv.index(flag) + 1] if flag in sys.argv else None

        creds_override = _arg_after("--credentials")
        token_override = _arg_after("--token")
        scopes = CALENDAR_SCOPES if "--calendar" in sys.argv else SCOPES

        from googleapiclient.discovery import build

        print("Starting Gmail OAuth setup...")
        print("A browser window will open — log in with the Google account you want to connect")
        creds = _get_credentials(creds_override, token_override, scopes=scopes)
        service = build("gmail", "v1", credentials=creds)
        profile = service.users().getProfile(userId="me").execute()
        print(f"\nConnected as: {profile['emailAddress']}")
        print(f"Scopes: {'Gmail + Calendar' if scopes is CALENDAR_SCOPES else 'Gmail only'}")
        print(f"Token saved to: {Path(token_override) if token_override else TOKEN_FILE}")
    else:
        print("Gmail Agent")
        print("  --setup   Run OAuth flow and save credentials")
        print("            (add --credentials <file> --token <file> for a second account,")
        print("             add --calendar to also request Calendar API scope)")
        print("\nTo set up Gmail:")
        print("  1. Follow instructions at top of this file")
        print("  2. Save credentials JSON as gmail_credentials.json")
        print("  3. Run: python3 gmail_agent.py --setup")
