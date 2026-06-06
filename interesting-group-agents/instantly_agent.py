"""
Instantly.ai Agent
Handles campaign management, lead enrollment, and analytics.
Replaces Apollo's sequencing layer — Apollo is still used for prospecting only.
"""

import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

INSTANTLY_API_KEY = os.getenv("INSTANTLY_API_KEY")
BASE_URL = "https://api.instantly.ai/api/v2"

def _headers() -> dict:
    return {
        "Authorization": f"Bearer {INSTANTLY_API_KEY}",
        "Content-Type": "application/json",
    }

# Campaign IDs loaded from output/instantly_campaign_ids.json after setup
CAMPAIGN_IDS_FILE = "output/instantly_campaign_ids.json"


def _get(endpoint: str, params: dict = None) -> dict:
    resp = requests.get(f"{BASE_URL}/{endpoint}", headers=_headers(), params=params or {})
    resp.raise_for_status()
    return resp.json()


def _post(endpoint: str, payload: dict) -> dict:
    resp = requests.post(f"{BASE_URL}/{endpoint}", headers=_headers(), json=payload)
    resp.raise_for_status()
    return resp.json()


# ── Campaign management ───────────────────────────────────────────────────────

def list_campaigns() -> list:
    """Return all campaigns in the account."""
    data = _get("campaigns", {"limit": 100, "skip": 0})
    return data.get("items", [])


def get_campaign_id(name: str):
    """Look up a campaign ID by name."""
    campaigns = list_campaigns()
    for c in campaigns:
        if c.get("name", "").lower() == name.lower():
            return c.get("id")
    return None


def save_campaign_ids() -> dict:
    """
    Fetch all campaigns and save their IDs to disk.
    Maps industry key → campaign ID.
    Run once after creating campaigns in the Instantly UI.
    """
    campaigns = list_campaigns()
    mapping = {}
    industry_keywords = {
        "construction": "construction",
        "healthcare":   "healthcare",
        "logistics":    "logistics",
        "default":      "default",
    }
    for c in campaigns:
        name_lower = c.get("name", "").lower()
        for key, keyword in industry_keywords.items():
            if keyword in name_lower:
                mapping[key] = c.get("id")
                break

    os.makedirs("output", exist_ok=True)
    with open(CAMPAIGN_IDS_FILE, "w") as f:
        json.dump(mapping, f, indent=2)
    print(f"Campaign IDs saved: {mapping}")
    return mapping


def load_campaign_ids() -> dict:
    if os.path.exists(CAMPAIGN_IDS_FILE):
        with open(CAMPAIGN_IDS_FILE) as f:
            return json.load(f)
    raise FileNotFoundError(
        "No Instantly campaign IDs found. Run: python instantly_agent.py --save-campaigns"
    )


# ── Lead enrollment ───────────────────────────────────────────────────────────

def add_lead_to_campaign(
    campaign_id: str,
    email: str,
    first_name: str,
    last_name: str,
    company: str,
    title: str = "",
    personalization: str = "",
) -> bool:
    """
    Add a single lead to an Instantly campaign (v2 API).
    Returns True on success.
    """
    payload = {
        "campaign_id":           campaign_id,
        "skip_if_in_workspace":  True,
        "email":                 email,
        "first_name":            first_name,
        "last_name":             last_name,
        "company_name":          company,
        "personalization":       personalization,
        "custom_variables": {
            "title": title,
        },
    }
    try:
        _post("leads", payload)
        return True
    except requests.HTTPError as e:
        print(f"  Instantly lead add failed: {e.response.text[:120]}")
        return False


def detect_industry(company: str) -> str:
    c = (company or "").lower()
    if any(w in c for w in ["construct", "build", "contractor", "plumb", "electric", "hvac", "roofing"]):
        return "construction"
    if any(w in c for w in ["health", "clinic", "dental", "medical", "care", "therapy"]):
        return "healthcare"
    if any(w in c for w in ["transport", "logistic", "freight", "trucking", "delivery", "fleet"]):
        return "logistics"
    return "default"


def enroll_prospect(prospect: dict) -> bool:
    """
    Enroll a fully-revealed prospect into the right Instantly campaign.
    prospect must have: email, first_name, last_name, company, title
    Returns True if enrolled successfully.
    """
    campaign_ids = load_campaign_ids()
    industry = detect_industry(prospect.get("company", ""))
    campaign_id = campaign_ids.get(industry, campaign_ids.get("default"))

    if not campaign_id:
        print(f"  No campaign ID found for industry: {industry}")
        return False

    return add_lead_to_campaign(
        campaign_id  = campaign_id,
        email        = prospect["email"],
        first_name   = prospect.get("first_name", ""),
        last_name    = prospect.get("last_name", ""),
        company      = prospect.get("company", ""),
        title        = prospect.get("title", ""),
    )


# ── Analytics ─────────────────────────────────────────────────────────────────

def get_campaign_analytics(campaign_id: str) -> dict:
    """
    Pull analytics for a single campaign via v2 API.
    Returns raw analytics dict.
    """
    try:
        return _get(f"campaigns/{campaign_id}/analytics")
    except Exception:
        return {}


def get_all_campaign_stats() -> list:
    """
    Pull stats for all 4 TIG campaigns from Instantly v2 API.
    Returns real open/reply/click/bounce rates.
    """
    campaign_ids = load_campaign_ids()
    campaigns    = {c["id"]: c for c in list_campaigns()}
    stats        = []

    for industry, cid in campaign_ids.items():
        campaign  = campaigns.get(cid, {})
        name      = campaign.get("name", industry)
        # status: 1=active, 2=paused, 3=completed, 4=draft
        status    = campaign.get("status", 0)

        a = get_campaign_analytics(cid)

        sent      = a.get("emails_sent_count",      0) or 0
        opened    = a.get("open_count_unique",       0) or 0
        clicked   = a.get("link_click_count_unique", 0) or 0
        replied   = a.get("reply_count_unique",      0) or 0
        bounced   = a.get("bounced_count",           0) or 0
        opted_out = a.get("unsubscribed_count",      0) or 0
        leads     = a.get("contacted_count",         0) or 0

        open_rate   = round(opened  / sent * 100, 1) if sent > 0 else 0.0
        reply_rate  = round(replied / sent * 100, 1) if sent > 0 else 0.0
        click_rate  = round(clicked / sent * 100, 1) if sent > 0 else 0.0
        bounce_rate = round(bounced / sent * 100, 1) if sent > 0 else 0.0

        stats.append({
            "industry":    industry,
            "name":        name,
            "active":      status == 1,
            "leads":       leads,
            "sent":        sent,
            "opened":      opened,
            "open_rate":   open_rate,
            "clicked":     clicked,
            "click_rate":  click_rate,
            "replied":     replied,
            "reply_rate":  reply_rate,
            "bounced":     bounced,
            "bounce_rate": bounce_rate,
            "opted_out":   opted_out,
            "campaign_id": cid,
        })

    return stats


def get_recent_replies(since_hours: int = 24):
    """
    Pull replies that came in within the last N hours.
    Returns list of reply dicts with email, name, campaign, reply_text.
    """
    try:
        data = _get("emails", {"limit": 50, "filter": "reply"})
        replies = data.get("items", [])
        # Filter to recent ones
        cutoff = datetime.utcnow().timestamp() - (since_hours * 3600)
        recent = []
        for r in replies:
            ts_str = r.get("created_at", "")
            try:
                ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00")).timestamp()
                if ts >= cutoff:
                    recent.append(r)
            except Exception:
                recent.append(r)  # include if we can't parse the timestamp
        return recent
    except Exception as e:
        print(f"  Could not fetch replies: {e}")
        return []


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys

    if "--save-campaigns" in sys.argv:
        ids = save_campaign_ids()
        print(json.dumps(ids, indent=2))

    elif "--stats" in sys.argv:
        stats = get_all_campaign_stats()
        for s in stats:
            print(f"\n{s['name']}  [{'ACTIVE' if s['active'] else 'paused'}]")
            print(f"  Leads: {s['leads']}  |  Sent: {s['sent']}  |  Opened: {s['opened']} ({s['open_rate']}%)")
            print(f"  Replied: {s['replied']} ({s['reply_rate']}%)  |  Clicked: {s['clicked']} ({s['click_rate']}%)")
            print(f"  Bounced: {s['bounced']} ({s['bounce_rate']}%)  |  Opted out: {s['opted_out']}")

    elif "--list-campaigns" in sys.argv:
        for c in list_campaigns():
            print(f"  {c.get('id')}  {c.get('name')}  status={c.get('status')}")

    elif "--replies" in sys.argv:
        replies = get_recent_replies(since_hours=48)
        print(f"Replies (last 48h): {len(replies)}")
        for r in replies:
            print(f"  From: {r.get('from_address')}  |  {r.get('subject','')[:50]}")

    else:
        print("Usage:")
        print("  python instantly_agent.py --save-campaigns   # run once after UI setup")
        print("  python instantly_agent.py --stats            # show campaign stats")
        print("  python instantly_agent.py --list-campaigns   # list all campaigns")
        print("  python instantly_agent.py --replies          # show recent replies")
