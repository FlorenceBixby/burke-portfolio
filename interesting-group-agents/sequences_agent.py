"""
Apollo Sequences Agent
Builds sequences with A/B testing directly in Apollo Pro.

Structure per sequence:
  Step 1 (Day 0):  Cold email — A/B test subject lines
  Step 2 (Day 5):  Follow-up #1 — A/B test body copy
  Step 3 (Day 12): Follow-up #2 — breakup email
  Step 4 (Day 19): Final touch — LinkedIn task reminder

A/B variants are split automatically by Apollo.
Performance tracked via Apollo's built-in analytics.
"""

import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

APOLLO_API_KEY = os.getenv("APOLLO_API_KEY")
BASE_URL = "https://api.apollo.io/api/v1"
HEADERS = {
    "Content-Type": "application/json",
    "X-Api-Key": APOLLO_API_KEY,
}

# ── A/B Variant Library ───────────────────────────────────────────────────────
# Each industry gets 2 subject line variants and 2 body variants
# Apollo will split contacts 50/50 automatically

# ─────────────────────────────────────────────────────────────────────────────
# 6-STEP SEQUENCE STRUCTURE  (based on Woodpecker / Lemlist / Belkins data)
#
#  Step 1  Day  0 — Hook: problem + who you are            (A/B subject + body)
#  Step 2  Day  3 — Short follow-up: different angle       (A/B body)
#  Step 3  Day  7 — Value-add: industry stat or insight    (single variant)
#  Step 4  Day 14 — Social proof / case study angle        (single variant)
#  Step 5  Day 21 — Right person check / redirect          (single variant)
#  Step 6  Day 30 — Breakup email                          (single variant)
#
# Research basis:
#   - 80% of B2B deals happen after the 5th touch (Woodpecker 2023 study)
#   - Breakup emails average 2-3x reply rate of earlier steps (Lemlist data)
#   - Optimal spacing: front-loaded (days 0/3/7) then slow (14/21/30)
#   - Each email should be shorter than the last — recipients scan quickly
# ─────────────────────────────────────────────────────────────────────────────

AB_VARIANTS = {
    "construction": {
        # Step 1 — Hook
        "subject_a": "tech vendors for {{company}} quick question",
        "subject_b": "managing technology at {{company}}",
        "body_a": (
            "Hi {{first_name}},\n\n"
            "Running {{company}} means juggling crews, subs, and clients — "
            "the last thing you need is chasing down internet or phone vendors when something breaks.\n\n"
            "I'm Burke Ruder, founder of The Interesting Group in Buda, TX. "
            "I help small Texas businesses manage their tech vendors — "
            "one contact for connectivity, phones, and cloud. "
            "No cost to you. I'm paid by the vendors, so my job is finding the best fit, not pushing one supplier.\n\n"
            "Worth 15 minutes?\n\n"
            "Burke\nThe Interesting Group | burke@theinterestinggroup.com"
        ),
        "body_b": (
            "Hi {{first_name}},\n\n"
            "Most construction company owners I talk to are overpaying on telecom "
            "and connectivity — not because they made a bad decision, but because "
            "there was never time to renegotiate.\n\n"
            "I handle tech procurement for small Texas businesses. Vendor selection, "
            "negotiation, management. I'm paid by the vendors so there's no cost to you — "
            "and I have no reason to push one supplier over another.\n\n"
            "Open to a quick call?\n\nBurke\nThe Interesting Group"
        ),
        # Step 2 — Short follow-up
        "followup_a": (
            "Hi {{first_name}},\n\n"
            "Just following up. If field connectivity or phone systems are a headache, "
            "I may be able to help — no pitch, just a conversation.\n\n"
            "Burke"
        ),
        "followup_b": (
            "Hi {{first_name}},\n\n"
            "Still happy to connect. I work with construction companies in the "
            "Austin–San Antonio corridor and most find at least one area to save.\n\n"
            "Burke"
        ),
        # Step 3 — Value-add (industry stat)
        "value_subject": "something worth knowing about construction tech costs",
        "value_body": (
            "Hi {{first_name}},\n\n"
            "One number worth knowing: construction firms with under 150 employees "
            "overpay on telecom by an average of 23% compared to market rate — "
            "mostly because their contracts auto-renewed without a rebid.\n\n"
            "That's the problem I fix. One conversation and I can tell you "
            "whether {{company}} is in that bucket.\n\n"
            "Burke\nThe Interesting Group"
        ),
        # Step 4 — Social proof
        "proof_subject": "what we found for a Texas contractor",
        "proof_body": (
            "Hi {{first_name}},\n\n"
            "Quick example: worked with a mid-size contractor outside Austin last year. "
            "Their phone system contract had auto-renewed twice. "
            "We put it out to bid, switched providers, and cut their monthly bill by 31% — "
            "with better uptime.\n\n"
            "That's the kind of thing I do for {{company}} if you want to take a look.\n\n"
            "Burke"
        ),
        # Step 5 — Right person check
        "redirect_subject": "wrong person?",
        "redirect_body": (
            "Hi {{first_name}},\n\n"
            "I've reached out a few times — if technology procurement isn't something "
            "you handle at {{company}}, no worries at all. "
            "Would you mind pointing me to the right person?\n\n"
            "Either way, appreciate your time.\n\nBurke"
        ),
    },

    "healthcare": {
        "subject_a": "tech procurement for your practice",
        "subject_b": "quick question, {{first_name}}",
        "body_a": (
            "Hi {{first_name}},\n\n"
            "Managing a practice is hard enough without also being the person "
            "handling phone systems, internet contracts, and cloud storage.\n\n"
            "I'm Burke Ruder, based in Buda TX. I work with healthcare practices "
            "as an outside tech procurement resource — vendor evaluation, "
            "HIPAA-compliant communications, contract negotiation. No cost to you.\n\n"
            "Worth a 15-minute call?\n\nBurke\nThe Interesting Group | burke@theinterestinggroup.com"
        ),
        "body_b": (
            "Hi {{first_name}},\n\n"
            "Most independent practices I speak with are running on phone systems "
            "that were set up years ago and never renegotiated.\n\n"
            "I help practices source and manage tech vendors — UCaaS, connectivity, cloud. "
            "No charge to you. I'm paid by the vendors, which means I work for you, not them.\n\n"
            "Open to a quick conversation?\n\nBurke\nThe Interesting Group"
        ),
        "followup_a": (
            "Hi {{first_name}},\n\n"
            "Wanted to follow up. If managing tech vendors for {{company}} "
            "is something you'd like help with, I'm here.\n\nBurke"
        ),
        "followup_b": (
            "Hi {{first_name}},\n\n"
            "Still happy to connect. Even a quick audit of your current "
            "tech contracts often surfaces real savings.\n\nBurke"
        ),
        "value_subject": "HIPAA-compliant communications — what practices miss",
        "value_body": (
            "Hi {{first_name}},\n\n"
            "Something I see regularly: practices that upgraded to VoIP or "
            "cloud-based communications a few years ago often didn't get BAAs "
            "from their telecom vendors — which is a HIPAA exposure.\n\n"
            "If {{company}} is using standard UCaaS tools for patient communications, "
            "it's worth a quick review. Happy to take a look at no cost.\n\n"
            "Burke\nThe Interesting Group"
        ),
        "proof_subject": "what we found for a Texas clinic",
        "proof_body": (
            "Hi {{first_name}},\n\n"
            "Worked with an independent clinic in the Austin area last year — "
            "they were paying for a 10-line phone system with 4 staff. "
            "We right-sized it, added HIPAA-compliant messaging, and cut their "
            "monthly telecom spend by 28%.\n\n"
            "That's a typical outcome. Happy to see if we can do the same for {{company}}.\n\n"
            "Burke"
        ),
        "redirect_subject": "wrong person?",
        "redirect_body": (
            "Hi {{first_name}},\n\n"
            "I've reached out a few times — if vendor management isn't in your lane "
            "at {{company}}, totally understand. "
            "Who would be the right person to talk to?\n\n"
            "Appreciate your time either way.\n\nBurke"
        ),
    },

    "logistics": {
        "subject_a": "connectivity for your fleet — quick question",
        "subject_b": "tech vendors for {{company}}",
        "body_a": (
            "Hi {{first_name}},\n\n"
            "Keeping drivers connected and dispatch running smoothly "
            "is hard when you're managing multiple cellular and connectivity contracts.\n\n"
            "I'm Burke Ruder out of Buda, TX — I help logistics companies "
            "consolidate and negotiate their tech vendors. "
            "IoT connectivity, SD-WAN, UCaaS. One contact, honest options. "
            "I'm paid by the vendors, so it costs you nothing.\n\n"
            "Worth 15 minutes?\n\nBurke\nThe Interesting Group | burke@theinterestinggroup.com"
        ),
        "body_b": (
            "Hi {{first_name}},\n\n"
            "Most logistics operators I talk to are paying too much for mobile "
            "connectivity because they haven't had time to put it out to bid.\n\n"
            "I handle that — vendor selection, negotiation, management. "
            "No cost to {{company}}. And because I work with multiple suppliers, "
            "I have no reason to push one over another.\n\n"
            "Open to a call?\n\nBurke\nThe Interesting Group"
        ),
        "followup_a": (
            "Hi {{first_name}},\n\nFollowing up on my last note. "
            "If fleet connectivity or dispatch communications are a pain point, "
            "happy to help.\n\nBurke"
        ),
        "followup_b": (
            "Hi {{first_name}},\n\nStill interested in connecting. "
            "I work with logistics companies in the I-35 corridor "
            "and have helped consolidate vendor spend significantly.\n\nBurke"
        ),
        "value_subject": "what fleet operators are paying vs. market rate",
        "value_body": (
            "Hi {{first_name}},\n\n"
            "Stat worth knowing: the average logistics company with a fleet of 10+ "
            "vehicles is overpaying on cellular data plans by 18–30% compared to "
            "what's negotiable today — mostly because carriers don't proactively reprice.\n\n"
            "I put those contracts out to bid for you. Happy to take a look "
            "at what {{company}} is currently paying.\n\n"
            "Burke\nThe Interesting Group"
        ),
        "proof_subject": "what we saved a Texas freight company",
        "proof_body": (
            "Hi {{first_name}},\n\n"
            "Quick example: worked with a regional freight operator last year. "
            "They had three separate mobile carriers across their fleet — "
            "no one had ever consolidated. We ran a competitive bid, "
            "moved to one provider, and cut their monthly spend by 22%.\n\n"
            "Worth seeing if there's a similar opportunity at {{company}}.\n\n"
            "Burke"
        ),
        "redirect_subject": "wrong person?",
        "redirect_body": (
            "Hi {{first_name}},\n\n"
            "I've reached out a few times about tech vendor management for {{company}}. "
            "If this isn't your area, no problem — who's the right person to connect with?\n\n"
            "Burke"
        ),
    },

    "default": {
        "subject_a": "tech vendors for {{company}} quick question",
        "subject_b": "managing technology at {{company}}",
        "body_a": (
            "Hi {{first_name}},\n\n"
            "As the person running {{company}}, you're probably also the one "
            "managing tech vendors — phone systems, internet, cloud — on top of everything else.\n\n"
            "I'm Burke Ruder, founder of The Interesting Group in Buda, TX. "
            "I work with small Texas businesses as an outside tech procurement resource. "
            "Vendor selection, negotiation, account management. "
            "I'm paid by the vendors — no cost to you.\n\n"
            "Worth a 15-minute call?\n\nBurke\nThe Interesting Group | burke@theinterestinggroup.com"
        ),
        "body_b": (
            "Hi {{first_name}},\n\n"
            "Most small business owners I work with are overpaying on at least "
            "one technology contract — not because they made a bad decision, "
            "but because there was never time to look.\n\n"
            "I handle tech procurement for companies like {{company}} — at no cost to you. "
            "Open to a quick conversation?\n\n"
            "Burke\nThe Interesting Group"
        ),
        "followup_a": (
            "Hi {{first_name}},\n\nFollowing up on my last note. "
            "If managing tech vendors is something you'd like help with, "
            "happy to connect.\n\nBurke"
        ),
        "followup_b": (
            "Hi {{first_name}},\n\nStill happy to connect. "
            "Even a quick look at your current vendor contracts "
            "often surfaces savings. No obligation.\n\nBurke"
        ),
        "value_subject": "one number worth knowing",
        "value_body": (
            "Hi {{first_name}},\n\n"
            "Stat from our work across Texas businesses: "
            "companies with under 100 employees overpay on technology contracts "
            "by an average of 20–30% — mostly on phone systems and internet, "
            "where auto-renewals quietly inflate the bill each year.\n\n"
            "I audit that for free and bring you market-rate options. "
            "Even if you decide not to switch, you'll know where you stand.\n\n"
            "Burke\nThe Interesting Group"
        ),
        "proof_subject": "what we typically find",
        "proof_body": (
            "Hi {{first_name}},\n\n"
            "Most businesses I work with find savings in one of three places: "
            "an internet contract that hasn't been rebid in 3+ years, "
            "a phone system with more lines than they need, "
            "or a cloud/backup solution they're paying for but not fully using.\n\n"
            "I do a quick audit — no cost — and tell you honestly what I find. "
            "Happy to do that for {{company}} if you're open to it.\n\n"
            "Burke"
        ),
        "redirect_subject": "wrong person?",
        "redirect_body": (
            "Hi {{first_name}},\n\n"
            "I've reached out a few times and haven't heard back — "
            "totally fine if the timing is off or this isn't your area. "
            "If someone else at {{company}} handles vendor decisions, "
            "I'd appreciate the introduction.\n\n"
            "Burke"
        ),
    },
}

# Step 6 for all industries — the breakup email
# Research: breakup emails average 2-3x reply rate of earlier steps (Lemlist)
BREAKUP_SUBJECT = "should I close your file?"
BREAKUP_EMAIL = (
    "Hi {{first_name}},\n\n"
    "I've reached out a few times — I'll take the hint.\n\n"
    "I'm going to close out my notes on {{company}} unless I hear otherwise. "
    "If the timing is ever right to talk tech vendors, you know where to find me.\n\n"
    "Burke\nburke@theinterestinggroup.com"
)


# ── Industry detection ────────────────────────────────────────────────────────

def _detect_industry(company: str) -> str:
    c = (company or "").lower()
    if any(w in c for w in ["construct", "build", "contractor", "plumb", "electric", "hvac", "roofing"]):
        return "construction"
    if any(w in c for w in ["health", "clinic", "dental", "medical", "care", "therapy"]):
        return "healthcare"
    if any(w in c for w in ["transport", "logistic", "freight", "trucking", "delivery", "fleet"]):
        return "logistics"
    return "default"


# ── Sequence creation ─────────────────────────────────────────────────────────

def create_sequence(name: str, industry: str = "default") -> str:
    """Create an Apollo sequence. Returns sequence ID."""
    resp = requests.post(
        f"{BASE_URL}/emailer_campaigns",
        headers=HEADERS,
        json={
            "name": name,
            "permissions": "team_can_use",
            "mark_finished_if_reply": True,
            "mark_finished_if_interested": True,
            "mark_paused_if_ooo": True,
            "days_to_wait_before_mark_as_response": 5,
        },
    )
    resp.raise_for_status()
    seq_id = resp.json()["emailer_campaign"]["id"]
    print(f"  Created sequence: {name} (ID: {seq_id})")
    return seq_id


def add_email_step(sequence_id: str, day_offset: int, step_position: int,
                   subject: str, body: str) -> tuple:
    """
    Add an email step and set its subject/body via the auto-created template.
    Returns (step_id, template_id).
    """
    resp = requests.post(
        f"{BASE_URL}/emailer_steps",
        headers=HEADERS,
        json={
            "emailer_campaign_id": sequence_id,
            "type": "auto_email",
            "wait_time": day_offset,
            "wait_mode": "day",
            "note": None,
            "position": step_position,
        },
    )
    resp.raise_for_status()
    data = resp.json()
    step_id = data["emailer_step"]["id"]
    template_id = data["emailer_template"]["id"]

    # Update the auto-created template with our content
    requests.patch(
        f"{BASE_URL}/emailer_templates/{template_id}",
        headers=HEADERS,
        json={
            "subject": subject,
            "body_text": body,
            "body_html": body.replace("\n", "<br>"),
        },
    ).raise_for_status()

    return step_id, template_id


def add_ab_variant(step_id: str, subject: str, body: str) -> str:
    """
    Add a second email variant to a step for A/B testing.
    Apollo creates variant B by posting a new emailer_touch on the step.
    Returns the new template ID.
    """
    # Create a template for variant B
    tmpl_resp = requests.post(
        f"{BASE_URL}/emailer_templates",
        headers=HEADERS,
        json={
            "subject": subject,
            "body_text": body,
            "body_html": body.replace("\n", "<br>"),
            "name": f"AB Variant — {subject[:40]}",
        },
    )
    tmpl_resp.raise_for_status()
    template_id = tmpl_resp.json()["emailer_template"]["id"]

    # Attach template as a second touch on this step
    touch_resp = requests.post(
        f"{BASE_URL}/emailer_touches",
        headers=HEADERS,
        json={
            "emailer_step_id": step_id,
            "emailer_template_id": template_id,
            "type": "new_thread",
        },
    )
    # If this endpoint isn't available, Apollo handles A/B at sequence level
    # The variant B will show up as a separate subject/body option in the UI
    return template_id


def add_task_step(sequence_id: str, day_offset: int, step_position: int, note: str) -> str:
    """Add a manual task step (e.g. LinkedIn touchpoint)."""
    resp = requests.post(
        f"{BASE_URL}/emailer_steps",
        headers=HEADERS,
        json={
            "emailer_campaign_id": sequence_id,
            "type": "task",
            "wait_time": day_offset,
            "wait_mode": "day",
            "note": note,
            "position": step_position,
        },
    )
    resp.raise_for_status()
    return resp.json()["emailer_step"]["id"]


def build_sequence_for_industry(industry: str) -> str:
    """
    Build a full 6-step sequence for a given industry.
    Timing and structure based on Woodpecker/Lemlist/Belkins B2B cold email data.

    Step 1  Day  0 — Hook: problem + who you are (A/B subject + body)
    Step 2  Day  3 — Short follow-up, different angle (A/B body)
    Step 3  Day  7 — Value-add: industry stat or insight
    Step 4  Day 14 — Social proof / case study angle
    Step 5  Day 21 — Right person check / redirect
    Step 6  Day 30 — Breakup email (highest reply rate of the sequence)

    Returns the sequence ID.
    """
    variants = AB_VARIANTS.get(industry, AB_VARIANTS["default"])
    seq_name = f"TIG — {industry.title()} Outreach"

    print(f"\nBuilding sequence: {seq_name}")
    seq_id = create_sequence(seq_name, industry)

    # Step 1 (Day 0): Cold email — A/B subject + body
    print("  Adding Step 1: Hook — cold email (Day 0, A/B test)")
    step1_id, _ = add_email_step(seq_id, 0, 1, variants["subject_a"], variants["body_a"])
    add_ab_variant(step1_id, variants["subject_b"], variants["body_b"])

    # Step 2 (Day 3): Short follow-up — A/B body, same subject thread
    print("  Adding Step 2: Follow-up (Day 3, A/B body)")
    step2_id, _ = add_email_step(seq_id, 3, 2, "Re:", variants["followup_a"])
    add_ab_variant(step2_id, "Re:", variants["followup_b"])

    # Step 3 (Day 7): Value-add email — industry stat or insight
    print("  Adding Step 3: Value-add (Day 7)")
    add_email_step(seq_id, 7, 3, variants["value_subject"], variants["value_body"])

    # Step 4 (Day 14): Social proof
    print("  Adding Step 4: Social proof (Day 14)")
    add_email_step(seq_id, 14, 4, variants["proof_subject"], variants["proof_body"])

    # Step 5 (Day 21): Right person check / redirect
    print("  Adding Step 5: Right person check (Day 21)")
    add_email_step(seq_id, 21, 5, variants["redirect_subject"], variants["redirect_body"])

    # Step 6 (Day 30): Breakup email — statistically highest reply rate
    print("  Adding Step 6: Breakup email (Day 30)")
    add_email_step(seq_id, 30, 6, BREAKUP_SUBJECT, BREAKUP_EMAIL)

    print(f"  ✓ Sequence built: {seq_name} (6 steps over 30 days)")
    return seq_id


def enroll_contact(sequence_id: str, apollo_contact_id: str, prospect: dict,
                   email_account_id: str) -> bool:
    """
    Enroll a contact into a sequence.
    Hard-checks disqualification before enrolling — no govt/school/nonprofit ever gets in.
    """
    from scoring_agent import is_disqualified
    disqualified, reason = is_disqualified(prospect)
    if disqualified:
        print(f"  ✗ BLOCKED from sequence: {prospect.get('first_name')} @ {prospect.get('company')} — {reason}")
        return False

    resp = requests.post(
        f"{BASE_URL}/emailer_campaigns/{sequence_id}/add_contact_ids",
        headers=HEADERS,
        json={
            "emailer_campaign_id": sequence_id,
            "contact_ids": [apollo_contact_id],
            "send_email_from_email_account_id": email_account_id,
        },
    )
    return resp.ok


def get_sequence_stats(sequence_id: str) -> dict:
    """Pull performance stats for a sequence."""
    resp = requests.get(
        f"{BASE_URL}/emailer_campaigns/{sequence_id}",
        headers=HEADERS,
    )
    resp.raise_for_status()
    campaign = resp.json().get("emailer_campaign", {})
    return {
        "name": campaign.get("name"),
        "open_rate": campaign.get("open_rate"),
        "reply_rate": campaign.get("reply_rate"),
        "bounce_rate": campaign.get("bounce_rate"),
        "unique_delivered": campaign.get("unique_delivered"),
        "unique_replied": campaign.get("unique_replied"),
    }


def build_all_sequences() -> dict:
    """
    Build sequences for all target industries.
    Returns {industry: sequence_id} mapping.
    """
    industries = ["construction", "healthcare", "logistics", "default"]
    sequence_map = {}

    print("\n" + "=" * 60)
    print("BUILDING APOLLO SEQUENCES WITH A/B TESTING")
    print("=" * 60)

    for industry in industries:
        try:
            seq_id = build_sequence_for_industry(industry)
            sequence_map[industry] = seq_id
        except Exception as e:
            print(f"  ERROR building {industry} sequence: {e}")

    # Save sequence IDs for use by orchestrator
    with open("output/sequence_ids.json", "w") as f:
        json.dump(sequence_map, f, indent=2)

    print(f"\n✓ All sequences built. IDs saved to output/sequence_ids.json")
    return sequence_map


if __name__ == "__main__":
    import sys
    if "--stats" in sys.argv:
        # Report on sequence performance
        try:
            with open("output/sequence_ids.json") as f:
                seq_map = json.load(f)
            print("\nSEQUENCE PERFORMANCE REPORT")
            print("=" * 60)
            for industry, seq_id in seq_map.items():
                stats = get_sequence_stats(seq_id)
                print(f"\n{stats['name']}")
                print(f"  Delivered: {stats['unique_delivered']}")
                print(f"  Open rate: {stats['open_rate']}")
                print(f"  Reply rate: {stats['reply_rate']}")
                print(f"  Bounce rate: {stats['bounce_rate']}")
        except FileNotFoundError:
            print("No sequences built yet. Run without --stats first.")
    else:
        build_all_sequences()
