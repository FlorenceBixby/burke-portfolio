"""
The Interesting Group — Prospecting Orchestrator
Full pipeline: Search → Score → Draft Outreach → HubSpot → Gmail Drafts

Usage:
  python orchestrator.py                                      # all industries, all I-35 cities
  python orchestrator.py --industry construction              # filter by industry
  python orchestrator.py --industry healthcare --city "Austin, Texas"
  python orchestrator.py --max 50                            # pull more prospects
  python orchestrator.py --no-hubspot --no-gmail             # dry run, output JSON only
  python orchestrator.py --check-replies                     # scan inbox, update HubSpot stages
"""

import argparse
import json
import os
from datetime import datetime

from apollo_agent import run_search
from scoring_agent import score_all
from outreach_agent import draft_all
from hubspot_agent import sync_prospects_to_hubspot, get_or_create_pipeline, advance_deal_stage, STAGE_MAP


def save_results(results: list, run_label: str) -> str:
    """Save results to a JSON file for review."""
    os.makedirs("output", exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"output/prospects_{run_label}_{timestamp}.json"
    with open(filename, "w") as f:
        json.dump(results, f, indent=2)
    return filename


def print_summary(results: list) -> None:
    print("\n" + "=" * 60)
    print("PIPELINE SUMMARY")
    print("=" * 60)

    a_tier = [r for r in results if r.get("tier") == "A"]
    b_tier = [r for r in results if r.get("tier") == "B"]
    c_tier = [r for r in results if r.get("tier") == "C"]
    hubspot_synced = [r for r in results if r.get("hubspot_deal_id")]
    gmail_drafted = [r for r in results if r.get("gmail_draft_id")]

    print(f"Prospects found:        {len(results)}")
    print(f"  A tier (act now):     {len(a_tier)}")
    print(f"  B tier (act later):   {len(b_tier)}")
    print(f"  C tier (skip):        {len(c_tier)}")
    print(f"  Synced to HubSpot:    {len(hubspot_synced)}")
    print(f"  Gmail drafts created: {len(gmail_drafted)}")

    if a_tier:
        print(f"\nTop A-tier prospects:")
        for p in a_tier[:5]:
            outreach = p.get("outreach", {})
            hs = "✓ HubSpot" if p.get("hubspot_deal_id") else "○ HubSpot"
            gm = "✓ Gmail draft" if p.get("gmail_draft_id") else "○ Gmail draft"
            print(f"  • {p.get('first_name')} {p.get('last_name')} — {p.get('title')} @ {p.get('company')}")
            print(f"    Score: {p.get('score')} | {hs} | {gm}")
            print(f"    Subject: {outreach.get('subject', '')}")


def handle_replies():
    """
    Check Gmail for prospect replies and advance HubSpot deal stages.
    Run this daily or on-demand.
    """
    print("\n" + "=" * 60)
    print("CHECKING GMAIL REPLIES → HUBSPOT UPDATE")
    print("=" * 60)

    try:
        from gmail_agent import check_replies
    except ImportError as e:
        print(f"Gmail not set up yet: {e}")
        return

    replies = check_replies(since_days=7)
    if not replies:
        print("No new replies found.")
        return

    print(f"Found {len(replies)} unread messages:")
    _, stage_map = get_or_create_pipeline()
    responded_stage = stage_map.get("Responded")

    # Load the latest output file to match replies to deals
    output_files = sorted([f for f in os.listdir("output") if f.endswith(".json")], reverse=True)
    if not output_files:
        print("No prospect output files found — run the main pipeline first.")
        return

    with open(f"output/{output_files[0]}") as f:
        prospects = json.load(f)

    # Build a lookup: company name → deal_id
    deal_lookup = {
        p.get("company", "").lower(): p.get("hubspot_deal_id")
        for p in prospects
        if p.get("hubspot_deal_id")
    }

    for reply in replies:
        print(f"\n  From: {reply['from']}")
        print(f"  Subject: {reply['subject']}")
        print(f"  Preview: {reply['snippet'][:100]}")

        # Try to match reply to a prospect by checking if company name appears in from/subject
        matched_deal = None
        for company, deal_id in deal_lookup.items():
            if company in reply["from"].lower() or company in reply["subject"].lower():
                matched_deal = deal_id
                break

        if matched_deal and responded_stage:
            try:
                advance_deal_stage(matched_deal, responded_stage)
                print(f"  ✓ HubSpot deal advanced to 'Responded'")
            except Exception as e:
                print(f"  ✗ Could not update HubSpot: {e}")
        else:
            print(f"  ○ No matching deal found — update HubSpot manually if needed")


def run_pipeline(
    industry: str = None,
    city: str = None,
    max_results: int = 25,
    sync_hubspot: bool = True,
    create_gmail_drafts: bool = True,
) -> list:
    print("\n" + "=" * 60)
    print("THE INTERESTING GROUP — PROSPECT PIPELINE")
    print("=" * 60)

    # Step 1: Search Apollo (no credits spent)
    prospects = run_search(industry=industry, city=city, max_results=max_results)
    if not prospects:
        print("No prospects found. Try different filters.")
        return []

    # Step 2: Score and tier
    scored = score_all(prospects)

    # Step 3: Draft outreach for A-tier
    a_tier_with_outreach = draft_all(scored, tier_filter="A")
    b_and_c = [p for p in scored if p.get("tier") != "A"]
    final = a_tier_with_outreach + b_and_c

    # Step 4: Sync to HubSpot
    if sync_hubspot:
        final = sync_prospects_to_hubspot(final)
    else:
        print("\nSkipping HubSpot sync (--no-hubspot)")

    # Step 5: Create Gmail drafts (only for prospects with revealed emails)
    if create_gmail_drafts:
        has_email = [p for p in final if p.get("email")]
        if has_email:
            try:
                from gmail_agent import create_drafts_for_prospects
                final = create_drafts_for_prospects(final)
            except FileNotFoundError:
                print("\nGmail not configured yet — run: python3 gmail_agent.py --setup")
            except ImportError:
                print("\nGmail dependencies not installed — run:")
                print("  pip3 install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")
        else:
            print("\nNo revealed emails yet — spend Apollo credits to unlock contacts before Gmail drafts")
    else:
        print("\nSkipping Gmail drafts (--no-gmail)")

    # Step 6: Save results
    label = f"{industry or 'all'}_{(city or 'i35').replace(', ', '_').replace(' ', '_')}"
    output_file = save_results(final, label)

    print_summary(final)
    print(f"\nFull results saved to: {output_file}")

    return final


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="The Interesting Group prospect pipeline")
    parser.add_argument("--industry", type=str, default=None)
    parser.add_argument("--city", type=str, default=None)
    parser.add_argument("--max", type=int, default=25)
    parser.add_argument("--no-hubspot", action="store_true", help="Skip HubSpot sync")
    parser.add_argument("--no-gmail", action="store_true", help="Skip Gmail draft creation")
    parser.add_argument("--check-replies", action="store_true", help="Scan inbox and update HubSpot stages")
    args = parser.parse_args()

    if args.check_replies:
        handle_replies()
    else:
        run_pipeline(
            industry=args.industry,
            city=args.city,
            max_results=args.max,
            sync_hubspot=not args.no_hubspot,
            create_gmail_drafts=not args.no_gmail,
        )
