"""
HubSpot Agent
Manages contacts, deals, and pipeline for The Interesting Group.

Pipeline stages:
  1. New Lead       — prospect found, not yet contacted
  2. Outreach Sent  — email/LinkedIn sent
  3. Responded      — prospect replied
  4. Meeting Booked — call scheduled
  5. Proposal Sent  — quote/scope sent
  6. Closed Won     — deal signed
  7. Closed Lost    — not moving forward
"""

import os
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

HUBSPOT_KEY = os.getenv("HUBSPOT_API_KEY")
BASE_URL = "https://api.hubapi.com"
HEADERS = {
    "Authorization": f"Bearer {HUBSPOT_KEY}",
    "Content-Type": "application/json",
}

PIPELINE_ID = "default"

# Map our logical stage names to HubSpot's default pipeline stage IDs
STAGE_MAP = {
    "New Lead":       "appointmentscheduled",   # repurposed: prospect identified
    "Outreach Sent":  "qualifiedtobuy",          # repurposed: email/LinkedIn sent
    "Responded":      "presentationscheduled",   # repurposed: prospect replied
    "Meeting Booked": "decisionmakerboughtin",   # repurposed: call scheduled
    "Proposal Sent":  "contractsent",            # repurposed: quote sent
    "Closed Won":     "closedwon",
    "Closed Lost":    "closedlost",
}


# ── Pipeline setup ──────────────────────────────────────────────────────────

def get_or_create_pipeline() -> tuple:
    """
    Returns (pipeline_id, stage_map) using the existing default pipeline.
    """
    return PIPELINE_ID, STAGE_MAP


# ── Contacts ────────────────────────────────────────────────────────────────

def find_contact_by_name(first_name: str, company: str) -> str:
    """Search for an existing contact by first name + company."""
    resp = requests.post(
        f"{BASE_URL}/crm/v3/objects/contacts/search",
        headers=HEADERS,
        json={
            "filterGroups": [{
                "filters": [
                    {"propertyName": "firstname", "operator": "EQ", "value": first_name},
                    {"propertyName": "company", "operator": "EQ", "value": company},
                ]
            }],
            "properties": ["firstname", "lastname", "company", "email"],
            "limit": 1,
        },
    )
    resp.raise_for_status()
    results = resp.json().get("results", [])
    return results[0]["id"] if results else None


def create_contact(prospect: dict) -> str:
    """Create a new HubSpot contact from a prospect record. Returns contact ID."""
    props = {
        "firstname": prospect.get("first_name", ""),
        "lastname": prospect.get("last_name", "").replace("***", "").strip("*"),
        "jobtitle": prospect.get("title", ""),
        "company": prospect.get("company", ""),
        "website": prospect.get("website", ""),
    }
    # Add email only if revealed (Apollo credit spent)
    if prospect.get("email"):
        props["email"] = prospect["email"]
    # Remove empty strings to avoid API errors
    props = {k: v for k, v in props.items() if v}

    resp = requests.post(
        f"{BASE_URL}/crm/v3/objects/contacts",
        headers=HEADERS,
        json={"properties": props},
    )
    resp.raise_for_status()
    return resp.json()["id"]


def upsert_contact(prospect: dict) -> tuple:
    """
    Find or create a contact. Returns (contact_id, was_created).
    """
    existing_id = find_contact_by_name(
        prospect.get("first_name", ""),
        prospect.get("company", ""),
    )
    if existing_id:
        return existing_id, False

    contact_id = create_contact(prospect)
    return contact_id, True


# ── Deals ───────────────────────────────────────────────────────────────────

def find_deal_for_contact(contact_id: str, pipeline_id: str) -> str:
    """Check if a deal already exists for this contact in our pipeline."""
    resp = requests.post(
        f"{BASE_URL}/crm/v3/objects/deals/search",
        headers=HEADERS,
        json={
            "filterGroups": [{
                "filters": [
                    {"propertyName": "pipeline", "operator": "EQ", "value": pipeline_id},
                ]
            }],
            "properties": ["dealname", "pipeline", "dealstage"],
            "limit": 10,
        },
    )
    resp.raise_for_status()

    # Check associations
    for deal in resp.json().get("results", []):
        assoc_resp = requests.get(
            f"{BASE_URL}/crm/v3/objects/deals/{deal['id']}/associations/contacts",
            headers=HEADERS,
        )
        if assoc_resp.ok:
            contact_ids = [r["id"] for r in assoc_resp.json().get("results", [])]
            if contact_id in contact_ids:
                return deal["id"]
    return None


def create_deal(prospect: dict, contact_id: str, pipeline_id: str, stage_id: str) -> str:
    """Create a deal and associate it with a contact. Returns deal ID."""
    company = prospect.get("company", "Unknown")
    first_name = prospect.get("first_name", "")
    product_angle = prospect.get("outreach", {}).get("product_angle", "technology services")

    props = {
        "dealname": f"{first_name} — {company}",
        "pipeline": pipeline_id,
        "dealstage": stage_id,
        "description": f"Product angle: {product_angle}",
        "closedate": _close_date_90_days(),
    }

    resp = requests.post(
        f"{BASE_URL}/crm/v3/objects/deals",
        headers=HEADERS,
        json={"properties": props},
    )
    resp.raise_for_status()
    deal_id = resp.json()["id"]

    # Associate deal → contact
    requests.put(
        f"{BASE_URL}/crm/v3/objects/deals/{deal_id}/associations/contacts/{contact_id}/deal_to_contact",
        headers=HEADERS,
    )

    return deal_id


def advance_deal_stage(deal_id: str, stage_id: str) -> None:
    """Move a deal to a new pipeline stage."""
    requests.patch(
        f"{BASE_URL}/crm/v3/objects/deals/{deal_id}",
        headers=HEADERS,
        json={"properties": {"dealstage": stage_id}},
    ).raise_for_status()


# ── Notes ───────────────────────────────────────────────────────────────────

def log_note(contact_id: str, deal_id: str, note_body: str) -> None:
    """Log an activity note on both the contact and deal."""
    resp = requests.post(
        f"{BASE_URL}/crm/v3/objects/notes",
        headers=HEADERS,
        json={"properties": {
            "hs_note_body": note_body,
            "hs_timestamp": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        }},
    )
    if not resp.ok:
        return

    note_id = resp.json()["id"]

    for obj_type, obj_id, assoc_type in [
        ("contacts", contact_id, "note_to_contact"),
        ("deals", deal_id, "note_to_deal"),
    ]:
        requests.put(
            f"{BASE_URL}/crm/v3/objects/notes/{note_id}/associations/{obj_type}/{obj_id}/{assoc_type}",
            headers=HEADERS,
        )


# ── Main sync function ───────────────────────────────────────────────────────

def sync_prospects_to_hubspot(prospects: list) -> list:
    """
    Sync a list of A-tier prospects (with outreach drafts) to HubSpot.
    - Creates or finds contact
    - Creates deal in 'New Lead' stage
    - Logs the drafted email as a note
    Returns the prospects list with hubspot_contact_id and hubspot_deal_id added.
    """
    print("\nSyncing prospects to HubSpot...")
    pipeline_id, stage_map = get_or_create_pipeline()
    new_lead_stage = stage_map.get("New Lead")

    if not new_lead_stage:
        print("  ERROR: Could not find 'New Lead' stage in pipeline")
        return prospects

    results = []
    created = 0
    skipped = 0

    for prospect in prospects:
        if prospect.get("tier") != "A":
            results.append(prospect)
            continue

        first_name = prospect.get("first_name", "")
        company = prospect.get("company", "")

        try:
            contact_id, was_created = upsert_contact(prospect)

            # Only create a deal if this is a new contact
            if was_created:
                deal_id = create_deal(prospect, contact_id, pipeline_id, new_lead_stage)

                # Log the drafted outreach as a note
                outreach = prospect.get("outreach", {})
                if outreach:
                    note = (
                        f"📧 Drafted cold email:\n"
                        f"Subject: {outreach.get('subject', '')}\n\n"
                        f"{outreach.get('body', '')}\n\n"
                        f"---\n"
                        f"LinkedIn note: {outreach.get('linkedin_note', '')}"
                    )
                    log_note(contact_id, deal_id, note)

                print(f"  ✓ Created: {first_name} @ {company} → Deal + Note logged")
                created += 1
            else:
                deal_id = find_deal_for_contact(contact_id, pipeline_id) or "existing"
                print(f"  → Skipped: {first_name} @ {company} already in HubSpot")
                skipped += 1

            results.append({
                **prospect,
                "hubspot_contact_id": contact_id,
                "hubspot_deal_id": deal_id,
            })

        except Exception as e:
            print(f"  ✗ Error syncing {first_name} @ {company}: {e}")
            results.append(prospect)

    print(f"\nHubSpot sync complete: {created} created, {skipped} skipped")
    return results


def _close_date_90_days() -> str:
    from datetime import timedelta
    return (datetime.utcnow() + timedelta(days=90)).strftime("%Y-%m-%dT%H:%M:%SZ")


if __name__ == "__main__":
    # Test: verify pipeline setup
    pipeline_id, stage_map = get_or_create_pipeline()
    print(f"Pipeline ID: {pipeline_id}")
    print("Stages:")
    for label, sid in stage_map.items():
        print(f"  {label}: {sid}")
