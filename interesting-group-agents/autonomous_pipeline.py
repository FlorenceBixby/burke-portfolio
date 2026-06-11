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


def enrich_org(domain: str) -> dict:
    """
    Pull Apollo org enrichment for a company domain.
    Returns tech stack, keywords, employee count, description, phone.
    Free to call — does not spend reveal credits.
    """
    try:
        resp = requests.get(
            f"{APOLLO_BASE}/organizations/enrich",
            headers=APOLLO_HEADERS,
            params={"domain": domain},
            timeout=8,
        )
        if resp.ok:
            return resp.json().get("organization", {})
    except Exception:
        pass
    return {}


def build_personalization(person: dict, org: dict) -> str:
    """
    Craft a 1-line personalization snippet using Apollo org data.
    Used as the {{personalization}} variable in Instantly sequences.
    Falls back to empty string if nothing useful found.
    """
    tech = [t.lower() for t in (org.get("technology_names") or [])]
    keywords = " ".join(org.get("keywords") or []).lower()
    desc = (org.get("short_description") or "").lower()
    title = (person.get("title") or "").lower()
    company = (person.get("organization") or {}).get("name", "") or ""
    employees = org.get("estimated_num_employees") or 0

    # CCaaS signals
    if any(t in tech for t in ["five9", "genesys", "nice", "talkdesk", "avaya", "cisco contact center", "amazon connect"]):
        matched = next(t for t in ["Five9","Genesys","NICE","Talkdesk","Avaya","Amazon Connect"] if t.lower() in tech)
        return f"I saw {company} is running {matched} — wanted to reach out about optimizing that contract."

    # UCaaS / phone system
    if any(t in tech for t in ["ringcentral", "vonage", "8x8", "zoom phone", "microsoft teams", "webex"]):
        matched = next(t for t in ["RingCentral","Vonage","8x8","Zoom Phone","Microsoft Teams","Webex"] if t.lower() in tech)
        return f"Noticed {company} is on {matched} — I work with a few vendors who compete aggressively on that."

    # Security stack signals
    if any(t in tech for t in ["crowdstrike", "sentinelone", "palo alto", "fortinet", "zscaler", "okta"]):
        matched = next(t for t in ["CrowdStrike","SentinelOne","Palo Alto","Fortinet","Zscaler","Okta"] if t.lower() in tech)
        return f"Saw {company} is using {matched} — I help businesses benchmark those contracts."

    # Generic tech stack mention
    if tech:
        top = [t for t in tech if t not in ("google analytics","wordpress","jquery","bootstrap","font awesome")][:2]
        if top:
            return f"Noticed {company} is running {' and '.join(t.title() for t in top)} — always good context before reaching out."

    # Industry/keyword signal
    if "veteran" in keywords or "veteran" in desc:
        return f"Respect the veteran-owned operation at {company} — that's a rare commitment."

    return ""


def smart_route_industry(person: dict, org: dict) -> str:
    """
    Enhanced enterprise routing using Apollo org enrichment data.
    Supplements employee-count routing with tech stack and keyword signals.
    """
    from instantly_agent import detect_industry

    tech = [t.lower() for t in (org.get("technology_names") or [])]
    keywords = " ".join(org.get("keywords") or []).lower()
    desc = (org.get("short_description") or "").lower()
    employees = org.get("estimated_num_employees") or person.get("employees", 0) or 0
    title = (person.get("title") or "").lower()
    company = (person.get("organization") or {}).get("name", "") or ""

    # Hard CCaaS signals in tech stack → always CCaaS regardless of size
    ccaas_tech = ["five9", "genesys", "nice", "talkdesk", "avaya", "cisco contact center",
                  "amazon connect", "twilio", "zendesk talk", "freshcaller"]
    if any(t in tech for t in ccaas_tech):
        return "ccaas"

    # Contact center / customer experience keywords
    ccaas_kw = ["contact center", "call center", "customer experience", "cx platform",
                "omnichannel", "ivr", "workforce management", "customer engagement"]
    if any(k in keywords or k in desc for k in ccaas_kw):
        return "ccaas"

    # Security stack signals → enterprise_security
    sec_tech = ["crowdstrike", "sentinelone", "palo alto", "fortinet", "zscaler",
                "okta", "cyberark", "carbon black", "splunk", "darktrace"]
    if any(t in tech for t in sec_tech):
        return "enterprise_security"

    # Fall back to title + employee count routing
    return detect_industry(company, employees=employees, title=title)


def reveal_and_enroll(person_id: str, company: str, first_name: str) -> bool:
    """
    Spend 1 Apollo credit to reveal contact details, then enroll in Instantly campaign.
    Enriches org data for smart routing and personalization before enrolling.
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

    # ── Org enrichment (no credit cost) ──────────────────────────────────────
    org_data = {}
    domain = (person.get("organization") or {}).get("primary_domain", "")
    if not domain:
        # Derive domain from email
        email_raw = person.get("email", "") or ""
        if "@" in email_raw:
            domain = email_raw.split("@")[1]
    if domain:
        org_data = enrich_org(domain)

    # ── Build personalization line ────────────────────────────────────────────
    personalization = build_personalization(person, org_data)

    # ── Smart industry routing ────────────────────────────────────────────────
    industry = smart_route_industry(person, org_data)

    # Build prospect dict
    prospect = {
        "first_name":      person.get("first_name"),
        "last_name":       person.get("last_name"),
        "title":           person.get("title"),
        "company":         (person.get("organization") or {}).get("name", company),
        "email":           person.get("email"),
        "phone":           person.get("direct_phone") or org_data.get("phone"),
        "employees":       org_data.get("estimated_num_employees", 0),
        "tech_stack":      (org_data.get("technology_names") or [])[:10],
        "personalization": personalization,
        "industry":        industry,  # pre-computed, skip re-detection in enroll_prospect
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

    if personalization:
        log(f"  📍 Personalization: {personalization[:60]}...")
    log(f"  🎯 Route: {industry}")

    # Enroll in Instantly campaign
    enrolled = enroll_prospect(prospect)
    if enrolled:
        log(f"  ✓ Enrolled: {prospect['first_name']} {prospect.get('last_name','')} @ {prospect['company']} → Instantly [{industry}]")
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

    # ── Inbox placement check ─────────────────────────────────────────────────
    # Run a deliverability test at the start of each batch so we catch spam
    # issues before they affect real prospects. Results show up in daily recap.
    try:
        from instantly_agent import run_inbox_placement_test, get_inbox_placement_results, get_latest_placement_test_id
        prior_test_id = get_latest_placement_test_id()
        if prior_test_id:
            prior = get_inbox_placement_results(prior_test_id)
            if prior.get("status") == "complete":
                inbox_pct = prior.get("inbox_pct", 100)
                log(f"📬 Last deliverability test: {inbox_pct}% inbox | {prior.get('spam_pct',0)}% spam")
                if inbox_pct < 70:
                    log("⚠️  WARNING: Inbox rate below 70% — check sending reputation before continuing.")
        # Fire a fresh test for next run's check
        new_test = run_inbox_placement_test()
        if new_test.get("id"):
            log(f"📬 Deliverability test queued (id: {new_test['id'][:8]}…) — results in ~1hr")
    except Exception as e:
        log(f"  (Inbox placement check skipped: {e})")

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

    # ── SCOUT: submit enrolled emails to Sandler connectivity database ────────
    scout_emails = _get_todays_enrolled_emails()
    if scout_emails:
        _submit_to_scout(scout_emails)

    return {"enrolled": enrolled_count, "skipped": skipped_count}


def _get_todays_enrolled_emails() -> list:
    """Collect email addresses enrolled today from the pipeline log."""
    emails = []
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        with open(LOG_FILE) as f:
            for line in f:
                if today in line and "✓ Enrolled" in line:
                    # Extract email from log line if present
                    # Log format: [timestamp] ✓ Enrolled: FirstName LastName @ Company → Instantly [industry]
                    # We need to get the actual email — read from revealed_contacts.json
                    pass
        # Better: read the Instantly leads added today from campaign stats delta
        # Simplest reliable source: parse output/revealed_contacts.json for today
        rc_path = "output/revealed_contacts.json"
        if os.path.exists(rc_path):
            with open(rc_path) as f:
                contacts = json.load(f)
            today_contacts = [
                c for c in contacts
                if c.get("enrolled_date", "").startswith(today) or
                   c.get("email", "") and today in c.get("enrolled_date", "")
            ]
            emails = [c["email"] for c in today_contacts if c.get("email")]
    except Exception as e:
        log(f"  (SCOUT email collection: {e})")
    return emails


def _submit_to_scout(emails: list) -> None:
    """
    Email Sandler SCOUT with today's enrolled prospect emails.
    SCOUT returns connectivity data (phone, social, etc.) for each address.
    Sends one email with all addresses — SCOUT processes the list automatically.
    """
    if not emails:
        return

    try:
        from gmail_agent import _get_gmail_service
        import base64
        from email.mime.text import MIMEText

        count   = len(emails)
        subject = f"SCOUT Request — {count} prospect{'s' if count > 1 else ''} — {datetime.now().strftime('%b %d %Y')}"
        body    = "\n".join(emails)

        msg = MIMEText(body)
        msg["to"]      = "scout@sandlerpartners.com"
        msg["from"]    = "burke@theinterestinggroup.com"
        msg["subject"] = subject

        service = _get_gmail_service()
        raw     = base64.urlsafe_b64encode(msg.as_bytes()).decode()
        service.users().messages().send(userId="me", body={"raw": raw}).execute()
        log(f"📡 SCOUT: submitted {count} emails to scout@sandlerpartners.com")
    except Exception as e:
        log(f"  (SCOUT submit failed: {e})")


def reply_check() -> dict:
    """
    Daily run. Scans Gmail for replies, classifies intent, drafts responses,
    and advances HubSpot deal stages automatically.
    """
    log("=== REPLY CHECK ===")

    try:
        from gmail_agent import check_replies, create_threaded_draft
        from hubspot_agent import advance_deal_stage, upsert_contact, STAGE_MAP
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

        # ── Positive reply: create/update HubSpot + notify Burke ─────────────
        POSITIVE_INTENTS = ("INTERESTED", "MEETING_REQUEST", "POSITIVE", "QUESTION")
        if intent in POSITIVE_INTENTS:
            try:
                # Upsert contact + deal in HubSpot
                contact_id, deal_id_new = upsert_contact(prospect)
                if deal_id_new and responded_stage:
                    advance_deal_stage(deal_id_new, responded_stage)
                    log(f"  ✓ HubSpot: contact + deal created/updated (intent: {intent})")
                    advanced += 1
            except Exception as e:
                log(f"  ✗ HubSpot upsert failed: {e}")

            # Notify Burke immediately
            try:
                _notify_positive_reply(from_email, prospect, subject, intent)
            except Exception as e:
                log(f"  ✗ Positive reply notify failed: {e}")

        # Handle unsubscribes in HubSpot
        if intent == "UNSUBSCRIBE":
            log(f"  ⚠ UNSUBSCRIBE REQUEST — remove from Apollo sequence manually")

        # Advance HubSpot deal for non-positive intents too
        deal_id = prospect.get("hubspot_deal_id")
        if deal_id and responded_stage and intent not in ("OOO",) and intent not in POSITIVE_INTENTS:
            try:
                advance_deal_stage(deal_id, responded_stage)
                log(f"  ✓ HubSpot deal advanced to Responded")
                advanced += 1
            except Exception as e:
                log(f"  ✗ HubSpot update failed: {e}")

    log(f"\nReply check complete: {len(replies)} replies, {drafted} drafts created, {advanced} deals advanced")
    return {"replies": len(replies), "advanced": advanced, "drafted": drafted}


def _notify_positive_reply(from_email: str, prospect: dict, subject: str, intent: str) -> None:
    """Send Burke an instant notification email when a prospect replies positively."""
    from gmail_agent import _get_gmail_service
    import base64
    from email.mime.text import MIMEText

    name    = f"{prospect.get('first_name','') or ''} {prospect.get('last_name','') or ''}".strip() or from_email
    company = prospect.get("company", "")
    label   = {
        "INTERESTED":       "🔥 INTERESTED",
        "MEETING_REQUEST":  "📅 MEETING REQUEST",
        "POSITIVE":         "👍 POSITIVE REPLY",
        "QUESTION":         "❓ HAS A QUESTION",
    }.get(intent, intent)

    body = (
        f"{label}\n\n"
        f"From:    {name}\n"
        f"Company: {company}\n"
        f"Email:   {from_email}\n"
        f"Subject: {subject}\n\n"
        f"→ HubSpot deal created/updated automatically.\n"
        f"→ Draft reply queued in Gmail.\n\n"
        f"Reply now: mailto:{from_email}\n\n"
        f"— ARIA"
    )

    msg            = MIMEText(body)
    msg["to"]      = "burke.ruder@gmail.com"
    msg["from"]    = "burke@theinterestinggroup.com"
    msg["subject"] = f"🔔 {label} — {name} @ {company}"

    service = _get_gmail_service()
    raw     = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    service.users().messages().send(userId="me", body={"raw": raw}).execute()
    log(f"  📨 Positive reply notification sent to burke.ruder@gmail.com")


def morning_briefing() -> None:
    """
    Daily 6:45 AM CT run.
    Sends Burke a crisp morning briefing: overnight replies, yesterday's enrollments,
    campaign health snapshot, deliverability status, and any action items.
    """
    log("=== MORNING BRIEFING ===")

    from instantly_agent import get_all_campaign_stats, get_recent_replies, get_latest_placement_test_id, get_inbox_placement_results

    today     = datetime.now().strftime("%A, %B %d")
    seq_stats = get_all_campaign_stats()

    # ── Overnight replies (last 12 hours) ────────────────────────────────────
    overnight_replies = get_recent_replies(since_hours=12)

    # ── Yesterday enrollments from log ───────────────────────────────────────
    enrolled_yesterday = 0
    try:
        yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        with open(LOG_FILE) as f:
            for line in f:
                if yesterday in line and "✓ Enrolled" in line:
                    enrolled_yesterday += 1
    except FileNotFoundError:
        pass

    # ── Campaign totals ───────────────────────────────────────────────────────
    total_leads   = sum(s["leads"]   for s in seq_stats)
    total_sent    = sum(s["sent"]    for s in seq_stats)
    total_opened  = sum(s["opened"]  for s in seq_stats)
    total_replied = sum(s["replied"] for s in seq_stats)
    avg_open_rate  = round(total_opened  / total_sent * 100, 1) if total_sent else 0
    avg_reply_rate = round(total_replied / total_sent * 100, 1) if total_sent else 0

    # ── Action items ──────────────────────────────────────────────────────────
    paused = [s["name"] for s in seq_stats if not s["active"] and s["leads"] > 0]
    action_items = []
    if paused:
        action_items.append(f"⚠️  {len(paused)} campaign(s) paused — activate in Instantly")
    if overnight_replies:
        positives = []
        try:
            from reply_agent import classify_reply
            for r in overnight_replies:
                intent = classify_reply(r.get("body", ""), r.get("snippet", ""))
                if intent in ("INTERESTED", "MEETING_REQUEST", "POSITIVE", "QUESTION"):
                    sender = r.get("to_address_email_list") or r.get("from_address_email") or "?"
                    positives.append(sender)
        except Exception:
            pass
        if positives:
            for p in positives:
                action_items.append(f"🔥 Positive reply from {p} — check Gmail drafts")

    # ── Deliverability ────────────────────────────────────────────────────────
    deliverability_line = ""
    try:
        test_id = get_latest_placement_test_id()
        if test_id:
            result = get_inbox_placement_results(test_id)
            if result.get("status") == "complete":
                inbox_pct = result.get("inbox_pct", 0)
                icon = "✅" if inbox_pct >= 80 else ("⚠️" if inbox_pct >= 60 else "🚨")
                deliverability_line = f"{icon} Inbox rate: {inbox_pct}%  |  Spam: {result.get('spam_pct',0)}%"
                if inbox_pct < 70:
                    action_items.append("🚨 Inbox rate below 70% — check sending reputation")
    except Exception:
        pass

    sep = "─" * 48
    lines = [
        f"Good morning. Here's your pipeline for {today}.",
        "",
    ]

    # Action items first
    if action_items:
        lines += [sep, "  ACTION ITEMS", sep]
        for item in action_items:
            lines.append(f"  {item}")
        lines.append("")

    # Overnight activity
    lines += [
        sep,
        "  OVERNIGHT",
        sep,
        f"  Replies:          {len(overnight_replies)}",
        f"  Enrolled (yest):  {enrolled_yesterday}",
        "",
    ]

    # Pipeline snapshot
    lines += [
        sep,
        "  PIPELINE SNAPSHOT",
        sep,
        f"  Total in sequence : {total_leads}",
        f"  Emails sent       : {total_sent}",
        f"  Open rate         : {avg_open_rate}%",
        f"  Reply rate        : {avg_reply_rate}%",
        "",
    ]

    # Deliverability
    if deliverability_line:
        lines += [sep, "  DELIVERABILITY", sep, f"  {deliverability_line}", ""]

    # Active campaigns
    lines += [sep, "  CAMPAIGNS", sep]
    for s in seq_stats:
        status = "●" if s["active"] else "○"
        lines.append(f"  {status} {s['name']}  —  {s['leads']} leads  |  {s['sent']} sent  |  {s['open_rate']}% open  |  {s['reply_rate']}% reply")
    lines += ["", "— ARIA", ""]

    body = "\n".join(lines)
    log(f"\n{body}")

    # Send
    try:
        from gmail_agent import create_draft, _get_gmail_service
        draft_id = create_draft(
            to_email="burke.ruder@gmail.com",
            subject=f"☀️ Morning Briefing — {today}",
            body=body,
        )
        service = _get_gmail_service()
        service.users().drafts().send(userId="me", body={"id": draft_id}).execute()
        log("Morning briefing sent to burke.ruder@gmail.com")
    except Exception as e:
        log(f"Could not send morning briefing: {e}")


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
            sender = (r.get("to_address_email_list") or r.get("from_address_email") or "unknown")
            subject = (r.get("subject") or "(no subject)")[:60]
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

    # Inbox placement / deliverability
    try:
        from instantly_agent import get_latest_placement_test_id, get_inbox_placement_results
        test_id = get_latest_placement_test_id()
        if test_id:
            result = get_inbox_placement_results(test_id)
            lines.append(sep)
            lines.append("  DELIVERABILITY")
            lines.append(sep)
            if result.get("status") == "complete":
                inbox_pct = result.get("inbox_pct", 0)
                spam_pct  = result.get("spam_pct", 0)
                icon = "✅" if inbox_pct >= 80 else ("⚠️" if inbox_pct >= 60 else "🚨")
                lines.append(f"  {icon}  Inbox: {inbox_pct}%  |  Spam: {spam_pct}%  |  Tested: {result.get('total',0)} mailboxes")
                if inbox_pct < 80:
                    lines.append("  ⚠️  Action needed: inbox rate below 80%. Check SPF/DKIM/warmup.")
            elif result.get("status") == "pending":
                lines.append("  ⏳  Last test still processing — check back tomorrow.")
            lines.append("")
    except Exception as e:
        pass

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
    elif task == "briefing":
        morning_briefing()
    else:
        print(f"Unknown task: {task}")
        print("Usage: python autonomous_pipeline.py [prospect|replies|digest|recap|briefing]")
