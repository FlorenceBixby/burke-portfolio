"""
The Interesting Group — Autonomous Pipeline
Runs on a schedule. No human input required.

Schedule (set via cron):
  Mon & Wed 6:00 AM CT  → prospect_run()   (finds + reveals + enrolls 25 contacts each)
  Daily      7:00 AM CT → reply_check()    (Gmail replies → HubSpot stage advances)
  Sunday     7:00 PM CT → weekly_digest()  (email report to burke@theinterestinggroup.com)

Credit budget: 50 reveals/week (25 Mon + 25 Wed). Stops if balance < 10.
"""

import json
import os
import sys
from datetime import datetime, timedelta

import requests
from dotenv import load_dotenv

load_dotenv()

APOLLO_API_KEY = os.getenv("APOLLO_API_KEY")
APOLLO_BASE = "https://api.apollo.io/api/v1"
APOLLO_HEADERS = {"Content-Type": "application/json", "X-Api-Key": APOLLO_API_KEY}

# Sequence IDs (from output/sequence_ids.json)
SEQUENCE_IDS_FILE = "output/sequence_ids.json"

# Email sending account
EMAIL_ACCOUNT_ID = "68cde88f2e9ac60011cc79f2"

# Industries to rotate through across the week
INDUSTRY_ROTATION = ["construction", "healthcare", "logistics", "default"]

# Log file
LOG_FILE = "output/pipeline.log"


# ── Helpers ───────────────────────────────────────────────────────────────────

def log(msg: str) -> None:
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    os.makedirs("output", exist_ok=True)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")


def load_sequence_ids() -> dict:
    with open(SEQUENCE_IDS_FILE) as f:
        return json.load(f)


def get_credit_balance() -> int:
    """Check Apollo credit balance. Returns remaining credits or 0 on error."""
    try:
        resp = requests.get(f"{APOLLO_BASE}/credits_info", headers=APOLLO_HEADERS)
        if resp.ok:
            data = resp.json()
            # Apollo returns credits in a nested structure
            credits = data.get("credits", {})
            remaining = credits.get("remaining_credits", credits.get("credits_used_in_period", None))
            if remaining is not None:
                return int(remaining)
        # Fallback: try a search and check the response
        return 999  # Assume ok if we can't check
    except Exception:
        return 999


def load_enrolled_ids() -> set:
    """Load set of Apollo person IDs already enrolled to avoid duplicates."""
    path = "output/enrolled_ids.json"
    if os.path.exists(path):
        with open(path) as f:
            return set(json.load(f))
    return set()


def save_enrolled_ids(ids: set) -> None:
    os.makedirs("output", exist_ok=True)
    with open("output/enrolled_ids.json", "w") as f:
        json.dump(list(ids), f)


def detect_industry(company: str) -> str:
    c = (company or "").lower()
    if any(w in c for w in ["construct", "build", "contractor", "plumb", "electric", "hvac", "roofing"]):
        return "construction"
    if any(w in c for w in ["health", "clinic", "dental", "medical", "care", "therapy"]):
        return "healthcare"
    if any(w in c for w in ["transport", "logistic", "freight", "trucking", "delivery", "fleet"]):
        return "logistics"
    return "default"


# ── Core pipeline steps ───────────────────────────────────────────────────────

def create_apollo_contact(person: dict) -> str:
    """
    Create (or find existing) contact in Apollo CRM.
    Returns Apollo CRM contact ID.
    """
    payload = {
        "first_name": person.get("first_name"),
        "last_name": person.get("last_name"),
        "title": person.get("title"),
        "organization_name": person.get("company"),
        "email": person.get("email"),
        "direct_phone": person.get("phone"),
    }
    # Strip None values
    payload = {k: v for k, v in payload.items() if v}

    resp = requests.post(f"{APOLLO_BASE}/contacts", headers=APOLLO_HEADERS, json=payload)
    if resp.ok:
        contact = resp.json().get("contact", {})
        return contact.get("id")

    # If conflict (already exists), try to find by email
    if resp.status_code == 422 and person.get("email"):
        search = requests.get(
            f"{APOLLO_BASE}/contacts/search",
            headers=APOLLO_HEADERS,
            params={"q_keywords": person.get("email"), "per_page": 1},
        )
        if search.ok:
            contacts = search.json().get("contacts", [])
            if contacts:
                return contacts[0].get("id")

    log(f"  Could not create contact for {person.get('first_name')} @ {person.get('company')}: {resp.text[:100]}")
    return None


def reveal_and_enroll(person_id: str, company: str, first_name: str) -> bool:
    """
    Spend 1 Apollo credit to reveal contact details, then enroll in Instantly campaign.
    Apollo = prospecting database only. Instantly = sequencing + analytics.
    Returns True if successfully enrolled.
    """
    from scoring_agent import is_disqualified
    from instantly_agent import enroll_prospect

    # Reveal via Apollo (spend 1 credit)
    resp = requests.post(
        f"{APOLLO_BASE}/people/match",
        headers=APOLLO_HEADERS,
        json={"id": person_id, "reveal_personal_emails": False},
    )
    if not resp.ok:
        log(f"  Reveal failed for {first_name} @ {company}: {resp.text[:80]}")
        return False

    person = resp.json().get("person", {})
    if not person:
        return False

    # Build prospect dict
    prospect = {
        "first_name": person.get("first_name"),
        "last_name":  person.get("last_name"),
        "title":      person.get("title"),
        "company":    (person.get("organization") or {}).get("name", company),
        "email":      person.get("email"),
        "phone":      person.get("direct_phone"),
    }

    # Disqualification check
    disqualified, reason = is_disqualified(prospect)
    if disqualified:
        log(f"  DQ: {prospect['first_name']} @ {prospect['company']} — {reason}")
        return False

    if not prospect.get("email"):
        log(f"  No email revealed for {prospect['first_name']} @ {prospect['company']} — skipping")
        return False

    # Skip guessed/extrapolated emails — bounce and hurt sender reputation
    email_status = person.get("email_status", "") or ""
    if email_status in ("guessed", "extrapolated", "unavailable"):
        log(f"  Skipping unverified email ({email_status}) for {prospect['first_name']} @ {prospect['company']}")
        return False

    # Enroll in Instantly campaign (replaces Apollo sequence enrollment)
    enrolled = enroll_prospect(prospect)
    if enrolled:
        log(f"  ✓ Enrolled: {prospect['first_name']} {prospect.get('last_name','')} @ {prospect['company']} → Instantly")
    else:
        log(f"  ✗ Enroll failed: {prospect['first_name']} @ {prospect['company']}")

    return enrolled


# ── Scheduled tasks ───────────────────────────────────────────────────────────

def load_search_state() -> dict:
    path = "output/search_state.json"
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return {"page": 1}

def save_search_state(state: dict) -> None:
    os.makedirs("output", exist_ok=True)
    with open("output/search_state.json", "w") as f:
        json.dump(state, f)

def prospect_run(target_reveals: int = 25) -> dict:
    """
    Monday & Wednesday run.
    Searches Apollo, scores prospects, reveals and enrolls the top ones.
    Paginates across runs so it never hits the same people twice.
    Stops if credit balance drops below 10.
    """
    from apollo_agent import search_prospects, format_prospect
    from scoring_agent import score_all

    log(f"=== PROSPECT RUN (target: {target_reveals} reveals) ===")

    credits = get_credit_balance()
    log(f"Apollo credits available: {credits}")
    if credits < 10:
        log("STOPPING: credit balance too low (< 10). Top up Apollo credits.")
        return {"enrolled": 0, "skipped": 0, "reason": "low_credits"}

    enrolled_ids = load_enrolled_ids()
    search_state = load_search_state()
    current_page = search_state.get("page", 1)
    enrolled_count = 0
    skipped_count = 0

    # Rotate through industries each run based on day of week
    day = datetime.now().weekday()  # 0=Mon, 2=Wed
    if day == 0:
        industries = ["construction", "healthcare"]
    else:
        industries = ["logistics", "default"]

    per_industry = max(1, (target_reveals * 3) // len(industries))

    for industry in industries:
        # Try current page first, fall back to next page if all already enrolled
        for page_attempt in [current_page, current_page + 1]:
            log(f"\nSearching: {industry} (page {page_attempt})")
            try:
                data = search_prospects(per_page=per_industry, industry=industry, page=page_attempt)
                people = data.get("people", [])
                if not people:
                    log(f"  No results on page {page_attempt} for {industry} — pool exhausted")
                    break

                prospects = [format_prospect(p) for p in people]
                scored = score_all(prospects)
                a_tier = [p for p in scored if p.get("tier") == "A"]
                new_a_tier = [p for p in a_tier if p["id"] not in enrolled_ids]

                log(f"  {len(people)} prospects, {len(a_tier)} A-tier, {len(new_a_tier)} new")

                for p in new_a_tier:
                    if enrolled_count >= target_reveals:
                        break
                    credits = get_credit_balance()
                    if credits < 10:
                        log("STOPPING: credit balance dropped below 10.")
                        break

                    success = reveal_and_enroll(p["id"], p["company"], p["first_name"])
                    enrolled_ids.add(p["id"])
                    if success:
                        enrolled_count += 1
                    else:
                        skipped_count += 1

                if enrolled_count >= target_reveals:
                    break

            except Exception as e:
                log(f"  ERROR in {industry} search page {page_attempt}: {e}")
                break

    # Advance page for next run if this page is getting stale
    next_page = current_page + 1 if skipped_count > enrolled_count else current_page
    save_search_state({"page": next_page})
    save_enrolled_ids(enrolled_ids)
    log(f"\nRun complete: {enrolled_count} enrolled, {skipped_count} skipped/DQ'd (next run: page {next_page})")
    return {"enrolled": enrolled_count, "skipped": skipped_count}


def reply_check() -> dict:
    """
    Daily run. Scans Gmail for replies, classifies intent, drafts responses,
    and advances HubSpot deal stages automatically.
    """
    log("=== REPLY CHECK ===")

    try:
        from gmail_agent import check_replies, create_threaded_draft
        from hubspot_agent import advance_deal_stage, STAGE_MAP
        from reply_agent import classify_reply, draft_response, process_reply
    except ImportError as e:
        log(f"Import error: {e}")
        return {"replies": 0, "advanced": 0, "drafted": 0}

    replies = check_replies(since_days=2)
    if not replies:
        log("No new replies.")
        return {"replies": 0, "advanced": 0, "drafted": 0}

    log(f"Found {len(replies)} replies")

    # Build lookup: email → {deal_id, prospect} from all output files
    contact_lookup = {}
    try:
        for fname in sorted(os.listdir("output"), reverse=True):
            if fname.startswith("prospects_") and fname.endswith(".json"):
                with open(f"output/{fname}") as f:
                    for p in json.load(f):
                        email = (p.get("email") or "").lower()
                        if email:
                            contact_lookup[email] = p
    except Exception as e:
        log(f"Could not load prospect files: {e}")

    advanced = 0
    drafted = 0
    responded_stage = STAGE_MAP.get("Responded")

    for reply in replies:
        raw_from = reply.get("from", "")
        from_email = raw_from.lower()
        if "<" in from_email:
            from_email = from_email.split("<")[1].rstrip(">").strip()

        subject = reply.get("subject", "")
        log(f"\n  Reply from: {raw_from}")
        log(f"  Subject: {subject[:70]}")

        # Classify intent
        intent = classify_reply(reply.get("body", ""), reply.get("snippet", ""))
        log(f"  Intent: {intent}")

        # Find matching prospect
        prospect = contact_lookup.get(from_email, {
            "first_name": raw_from.split("<")[0].strip().split()[0] if raw_from else "there",
            "company": "",
        })

        # Draft response (skip OOO and unsubscribe)
        if intent not in ("OOO", "UNSUBSCRIBE"):
            try:
                response = draft_response(intent, prospect, subject)
                if response["body"]:
                    draft_id = create_threaded_draft(
                        to_email=from_email,
                        subject=response["subject"],
                        body=response["body"],
                        thread_id=reply.get("thread_id", ""),
                    )
                    log(f"  ✓ Draft created (ID: {draft_id})")
                    log(f"  → Action: {response['action']}")
                    drafted += 1
            except Exception as e:
                log(f"  ✗ Could not create draft: {e}")

        # Handle unsubscribes
        if intent == "UNSUBSCRIBE":
            log(f"  ⚠ UNSUBSCRIBE REQUEST — remove from Apollo sequence manually")

        # Advance HubSpot deal
        deal_id = prospect.get("hubspot_deal_id")
        if deal_id and responded_stage and intent not in ("OOO",):
            try:
                advance_deal_stage(deal_id, responded_stage)
                log(f"  ✓ HubSpot deal advanced to Responded")
                advanced += 1
            except Exception as e:
                log(f"  ✗ HubSpot update failed: {e}")

    log(f"\nReply check complete: {len(replies)} replies, {drafted} drafts created, {advanced} deals advanced")
    return {"replies": len(replies), "advanced": advanced, "drafted": drafted}


def weekly_digest() -> None:
    """
    Sunday run. Compiles stats and emails a summary to burke@theinterestinggroup.com.
    """
    log("=== WEEKLY DIGEST ===")

    seq_ids = load_sequence_ids()

    # Pull sequence stats from Apollo
    seq_stats = []
    for industry, seq_id in seq_ids.items():
        resp = requests.get(f"{APOLLO_BASE}/emailer_campaigns/{seq_id}", headers=APOLLO_HEADERS)
        if resp.ok:
            c = resp.json().get("emailer_campaign", {})
            seq_stats.append({
                "name": c.get("name", industry),
                "delivered": c.get("unique_delivered", 0) or 0,
                "open_rate": round((c.get("open_rate") or 0) * 100, 1),
                "reply_rate": round((c.get("reply_rate") or 0) * 100, 1),
                "bounce_rate": round((c.get("bounce_rate") or 0) * 100, 1),
            })

    # Count new contacts enrolled this week from log
    enrolled_this_week = 0
    try:
        week_ago = datetime.now() - timedelta(days=7)
        with open(LOG_FILE) as f:
            for line in f:
                if "✓ Enrolled" in line:
                    try:
                        ts_str = line[1:20]
                        ts = datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S")
                        if ts > week_ago:
                            enrolled_this_week += 1
                    except Exception:
                        pass
    except FileNotFoundError:
        pass

    # Build email body
    now = datetime.now().strftime("%B %d, %Y")
    lines = [
        f"Weekly Report — The Interesting Group ({now})",
        "",
        f"New contacts enrolled this week: {enrolled_this_week}",
        "",
        "Sequence Performance:",
    ]
    for s in seq_stats:
        lines.append(f"  {s['name']}")
        lines.append(f"    Delivered: {s['delivered']}  |  Opens: {s['open_rate']}%  |  Replies: {s['reply_rate']}%  |  Bounces: {s['bounce_rate']}%")

    lines += [
        "",
        "Next steps with replies: Log into HubSpot and move responded deals forward.",
        "",
        "— Your pipeline agent",
    ]

    body = "\n".join(lines)
    log(f"\n{body}")

    # Send via Gmail
    try:
        from gmail_agent import create_draft
        draft_id = create_draft(
            to_email="burke.ruder@gmail.com",
            subject=f"TIG Weekly Report — {now}",
            body=body,
        )
        # Auto-send the draft
        from gmail_agent import _get_gmail_service
        import base64
        service = _get_gmail_service()
        service.users().drafts().send(userId="me", body={"id": draft_id}).execute()
        log("Weekly digest sent to burke@theinterestinggroup.com")
    except Exception as e:
        log(f"Could not send digest email: {e}")


def daily_recap() -> None:
    """
    Daily 7 PM run. Pulls real stats from Instantly and emails a clean recap
    to burke@theinterestinggroup.com. Full open/reply/click rates included.
    Apollo is used for prospecting only — Instantly owns sequencing + analytics.
    """
    log("=== DAILY SEQUENCE RECAP ===")

    today = datetime.now().strftime("%A, %B %d %Y")

    # Pull real stats from Instantly
    from instantly_agent import get_all_campaign_stats, get_recent_replies
    seq_stats = get_all_campaign_stats()

    # Count enrolled this week from log
    enrolled_this_week = 0
    try:
        week_ago = datetime.now() - timedelta(days=7)
        with open(LOG_FILE) as f:
            for line in f:
                if "✓ Enrolled" in line:
                    try:
                        ts = datetime.strptime(line[1:20], "%Y-%m-%d %H:%M:%S")
                        if ts > week_ago:
                            enrolled_this_week += 1
                    except Exception:
                        pass
    except FileNotFoundError:
        pass

    # Recent replies from Instantly
    recent_replies = get_recent_replies(since_hours=24)

    # Totals
    total_leads   = sum(s["leads"]   for s in seq_stats)
    total_sent    = sum(s["sent"]    for s in seq_stats)
    total_opened  = sum(s["opened"]  for s in seq_stats)
    total_replied = sum(s["replied"] for s in seq_stats)
    total_clicked = sum(s["clicked"] for s in seq_stats)
    total_bounced = sum(s["bounced"] for s in seq_stats)

    avg_open_rate  = round(total_opened  / total_sent * 100, 1) if total_sent > 0 else 0.0
    avg_reply_rate = round(total_replied / total_sent * 100, 1) if total_sent > 0 else 0.0
    avg_click_rate = round(total_clicked / total_sent * 100, 1) if total_sent > 0 else 0.0

    paused_campaigns = [s["name"] for s in seq_stats if not s["active"] and s["leads"] > 0]

    sep = "─" * 52
    lines = [
        f"Daily Sequence Recap",
        f"{today}",
        "",
    ]

    # ⚠ Paused alert
    if paused_campaigns:
        lines += [
            "⚠️  ACTION REQUIRED — CAMPAIGNS PAUSED",
            sep,
            "  These campaigns are paused in Instantly:",
            "",
        ]
        for name in paused_campaigns:
            lines.append(f"    • {name}")
        lines += ["", "  → app.instantly.ai → Campaigns → Activate", ""]

    # Totals
    lines += [
        sep,
        "  PIPELINE TOTALS",
        sep,
        f"  Total leads enrolled    : {total_leads}",
        f"  Emails sent             : {total_sent}",
        f"  Unique opens            : {total_opened}  ({avg_open_rate}%)",
        f"  Replies                 : {total_replied}  ({avg_reply_rate}%)",
        f"  Clicks                  : {total_clicked}  ({avg_click_rate}%)",
        f"  Bounced                 : {total_bounced}",
        f"  Enrolled this week      : {enrolled_this_week}",
        "",
    ]

    # New replies today
    if recent_replies:
        lines += [sep, f"  REPLIES TODAY ({len(recent_replies)})", sep]
        for r in recent_replies[:10]:
            sender = r.get("from_address") or r.get("reply_email", "unknown")
            subject = (r.get("subject", "") or "")[:50]
            lines.append(f"  • {sender}  —  {subject}")
        lines.append("")

    # By campaign
    lines += [sep, "  BY CAMPAIGN", sep]
    for s in seq_stats:
        status = "● ACTIVE" if s["active"] else "○ paused"
        lines.append(f"  {s['name']}  [{status}]")
        lines.append(
            f"    Leads: {s['leads']}  |  Sent: {s['sent']}  |  "
            f"Opens: {s['opened']} ({s['open_rate']}%)  |  "
            f"Replies: {s['replied']} ({s['reply_rate']}%)  |  "
            f"Clicks: {s['clicked']} ({s['click_rate']}%)  |  "
            f"Bounced: {s['bounced']} ({s['bounce_rate']}%)"
        )
        lines.append("")

    # Benchmarks
    lines += [
        sep,
        "  BENCHMARKS  (B2B cold email industry avg)",
        sep,
        f"  Open rate  — yours: {avg_open_rate}%   |  industry avg: 21%  |  good: >30%",
        f"  Reply rate — yours: {avg_reply_rate}%   |  industry avg: 1-3%  |  good: >5%",
        f"  Click rate — yours: {avg_click_rate}%   |  industry avg: 2-5%  |  good: >7%",
        "",
    ]

    # Cloudflare website traffic
    try:
        from cloudflare_agent import format_recap_section
        lines.append(format_recap_section())
    except Exception as e:
        lines.append(f"  (Website traffic unavailable: {e})")

    lines += [
        "",
        "— ARIA",
        "",
    ]

    body = "\n".join(lines)
    log(f"\n{body}")

    # Send
    try:
        from gmail_agent import create_draft
        from gmail_agent import _get_gmail_service
        draft_id = create_draft(
            to_email="burke.ruder@gmail.com",
            subject=f"TIG Daily Recap — {datetime.now().strftime('%b %d')}",
            body=body,
        )
        service = _get_gmail_service()
        service.users().drafts().send(userId="me", body={"id": draft_id}).execute()
        log("Daily recap sent to burke@theinterestinggroup.com")
    except Exception as e:
        log(f"Could not send recap email: {e}")


# ── Entrypoint ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    task = sys.argv[1] if len(sys.argv) > 1 else "prospect"

    if task == "prospect":
        prospect_run(target_reveals=25)
    elif task == "replies":
        reply_check()
    elif task == "digest":
        weekly_digest()
    elif task == "recap":
        daily_recap()
    else:
        print(f"Unknown task: {task}")
        print("Usage: python autonomous_pipeline.py [prospect|replies|digest|recap]")
