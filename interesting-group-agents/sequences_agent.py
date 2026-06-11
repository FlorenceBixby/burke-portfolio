"""
Apollo / Instantly Sequences Agent
Two-track outbound strategy:

  TRACK 1 — SMB (pays the bills today)
    Campaigns: construction, healthcare, logistics, default
    Target:    Owner / Office Manager / IT contact at 10–100 employee companies
    Angle:     Vendor cost savings, one point of contact, no cost to you
    Avg deal:  $3k–$15k MRR | Commission: ~$300–$1,500/mo per deal

  TRACK 2 — Enterprise (builds the wealth)
    Campaigns: ccaas, enterprise_security
    Target:    VP IT / CTO / VP CX / Dir Contact Center at 100–2,000 employee companies
    Angle:     Contact center modernization, Zero Trust / SASE security posture
    Avg deal:  $20k–$200k MRR | Commission: ~$2,000–$20,000/mo per deal

Sequence structure (both tracks):
  Step 1  Day  0 — Hook (A/B subject + body)
  Step 2  Day  3 — Short follow-up, different angle (A/B body)
  Step 3  Day  7 — Value-add: stat or insight
  Step 4  Day 14 — Social proof / case study
  Step 5  Day 21 — Right person check / redirect
  Step 6  Day 30 — Breakup email (2-3x avg reply rate per Lemlist data)

Research basis:
  - 80%+ of B2B deals happen after the 5th touch (Woodpecker 2023)
  - Breakup emails average 2-3x reply rate of earlier steps (Lemlist)
  - Front-loaded spacing (0/3/7) then slow cadence (14/21/30) outperforms uniform spacing
  - Enterprise sequences should be shorter per email — executives scan, not read
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


# ══════════════════════════════════════════════════════════════════════════════
# TRACK 1 — SMB  (pays the bills)
# Target: Owner / Office Manager / IT contact, 10–100 employees, Texas focus
# Angle: Vendor management, cost savings, one contact, no cost to them
# ══════════════════════════════════════════════════════════════════════════════

AB_VARIANTS = {

    # ── Construction ──────────────────────────────────────────────────────────
    "construction": {
        "subject_a": "tech vendors for {{company | your business}} — quick question",
        "subject_b": "managing technology at {{company | your business}}",
        "body_a": (
            "Hi {{first_name | there}},\n\n"
            "Running {{company | your business}} means juggling crews, subs, and clients — "
            "the last thing you need is chasing down internet or phone vendors when something breaks.\n\n"
            "I'm Burke Ruder, founder of The Interesting Group in Buda, TX. "
            "I help Texas businesses manage their tech vendors — "
            "one contact for connectivity, phones, and cloud. "
            "No cost to you. I'm paid by the vendors, so my job is finding the best fit, not pushing one supplier.\n\n"
            "Worth 15 minutes?\n\n"
            "Burke\nThe Interesting Group | burke@theinterestinggroup.com | https://theinterestinggroup.com?utm_source=instantly&utm_medium=email&utm_campaign={{industry}}"
        ),
        "body_b": (
            "Hi {{first_name | there}},\n\n"
            "Most construction companies I talk to are overpaying on telecom "
            "and connectivity — not because they made a bad decision, but because "
            "there was never time to renegotiate.\n\n"
            "I handle tech procurement for Texas businesses. Vendor selection, "
            "negotiation, management. I'm paid by the vendors so there's no cost to you — "
            "and I have no reason to push one supplier over another.\n\n"
            "Open to a quick call?\n\nBurke\nThe Interesting Group"
        ),
        "followup_a": (
            "Hi {{first_name | there}},\n\n"
            "Just following up. If field connectivity or phone systems are a headache, "
            "I may be able to help — no pitch, just a conversation.\n\nBurke"
        ),
        "followup_b": (
            "Hi {{first_name | there}},\n\n"
            "Still happy to connect. I work with construction companies in the "
            "Austin–San Antonio corridor and most find at least one area to save.\n\nBurke"
        ),
        "value_subject": "something worth knowing about construction tech costs",
        "value_body": (
            "Hi {{first_name | there}},\n\n"
            "One number worth knowing: construction firms with under 150 employees "
            "overpay on telecom by an average of 23% compared to market rate — "
            "mostly because contracts auto-renewed without a rebid.\n\n"
            "That's the problem I fix. One conversation and I can tell you "
            "whether {{company | your business}} is in that bucket.\n\nBurke\nThe Interesting Group"
        ),
        "proof_subject": "what we found for a Texas contractor",
        "proof_body": (
            "Hi {{first_name | there}},\n\n"
            "Quick example: worked with a mid-size contractor outside Austin last year. "
            "Their phone system contract had auto-renewed twice. "
            "We put it out to bid, switched providers, and cut their monthly bill by 31% — "
            "with better uptime.\n\n"
            "That's the kind of thing I do for {{company | your business}} if you want to take a look.\n\nBurke"
        ),
        "redirect_subject": "wrong person?",
        "redirect_body": (
            "Hi {{first_name | there}},\n\n"
            "I've reached out a few times — if technology procurement isn't something "
            "you handle at {{company | your business}}, no worries at all. "
            "Would you mind pointing me to the right person?\n\nAppreciate your time.\n\nBurke"
        ),
    },

    # ── Healthcare (SMB) ──────────────────────────────────────────────────────
    "healthcare": {
        "subject_a": "tech procurement for your practice",
        "subject_b": "quick question, {{first_name | there}}",
        "body_a": (
            "Hi {{first_name | there}},\n\n"
            "Managing a practice is hard enough without also being the person "
            "handling phone systems, internet contracts, and cloud storage.\n\n"
            "I'm Burke Ruder, based in Buda TX. I work with healthcare practices "
            "as an outside tech procurement resource — vendor evaluation, "
            "HIPAA-compliant communications, contract negotiation. No cost to you.\n\n"
            "Worth a 15-minute call?\n\nBurke\nThe Interesting Group | burke@theinterestinggroup.com | https://theinterestinggroup.com?utm_source=instantly&utm_medium=email&utm_campaign={{industry}}"
        ),
        "body_b": (
            "Hi {{first_name | there}},\n\n"
            "Most independent practices I speak with are running on phone systems "
            "that were set up years ago and never renegotiated.\n\n"
            "I help practices source and manage tech vendors — UCaaS, connectivity, cloud. "
            "No charge to you. I'm paid by the vendors, which means I work for you, not them.\n\n"
            "Open to a quick conversation?\n\nBurke\nThe Interesting Group"
        ),
        "followup_a": (
            "Hi {{first_name | there}},\n\n"
            "Wanted to follow up. If managing tech vendors for {{company | your business}} "
            "is something you'd like help with, I'm here.\n\nBurke"
        ),
        "followup_b": (
            "Hi {{first_name | there}},\n\n"
            "Still happy to connect. Even a quick audit of your current "
            "tech contracts often surfaces real savings.\n\nBurke"
        ),
        "value_subject": "HIPAA-compliant communications — what practices miss",
        "value_body": (
            "Hi {{first_name | there}},\n\n"
            "Something I see regularly: practices that upgraded to VoIP or "
            "cloud-based communications a few years ago often didn't get BAAs "
            "from their telecom vendors — which is a HIPAA exposure.\n\n"
            "If {{company | your business}} is using standard UCaaS tools for patient communications, "
            "it's worth a quick review. Happy to take a look at no cost.\n\nBurke\nThe Interesting Group"
        ),
        "proof_subject": "what we found for a Texas clinic",
        "proof_body": (
            "Hi {{first_name | there}},\n\n"
            "Worked with an independent clinic in the Austin area last year — "
            "they were paying for a 10-line phone system with 4 staff. "
            "We right-sized it, added HIPAA-compliant messaging, and cut their "
            "monthly telecom spend by 28%.\n\n"
            "Happy to see if we can do the same for {{company | your business}}.\n\nBurke"
        ),
        "redirect_subject": "wrong person?",
        "redirect_body": (
            "Hi {{first_name | there}},\n\n"
            "I've reached out a few times — if vendor management isn't in your lane "
            "at {{company | your business}}, totally understand. "
            "Who would be the right person to talk to?\n\nAppreciate your time.\n\nBurke"
        ),
    },

    # ── Logistics (SMB) ───────────────────────────────────────────────────────
    "logistics": {
        "subject_a": "connectivity for your fleet — quick question",
        "subject_b": "tech vendors for {{company | your business}}",
        "body_a": (
            "Hi {{first_name | there}},\n\n"
            "Keeping drivers connected and dispatch running smoothly "
            "is hard when you're managing multiple cellular and connectivity contracts.\n\n"
            "I'm Burke Ruder out of Buda, TX — I help logistics companies "
            "consolidate and negotiate their tech vendors. "
            "IoT connectivity, SD-WAN, UCaaS. One contact, honest options. "
            "I'm paid by the vendors, so it costs you nothing.\n\n"
            "Worth 15 minutes?\n\nBurke\nThe Interesting Group | burke@theinterestinggroup.com | https://theinterestinggroup.com?utm_source=instantly&utm_medium=email&utm_campaign={{industry}}"
        ),
        "body_b": (
            "Hi {{first_name | there}},\n\n"
            "Most logistics operators I talk to are paying too much for mobile "
            "connectivity because they haven't had time to put it out to bid.\n\n"
            "I handle that — vendor selection, negotiation, management. "
            "No cost to {{company | your business}}. And because I work with multiple suppliers, "
            "I have no reason to push one over another.\n\n"
            "Open to a call?\n\nBurke\nThe Interesting Group"
        ),
        "followup_a": (
            "Hi {{first_name | there}},\n\nFollowing up on my last note. "
            "If fleet connectivity or dispatch communications are a pain point, "
            "happy to help.\n\nBurke"
        ),
        "followup_b": (
            "Hi {{first_name | there}},\n\nStill interested in connecting. "
            "I work with logistics companies in the I-35 corridor "
            "and have helped consolidate vendor spend significantly.\n\nBurke"
        ),
        "value_subject": "what fleet operators are paying vs. market rate",
        "value_body": (
            "Hi {{first_name | there}},\n\n"
            "Stat worth knowing: the average logistics company with a fleet of 10+ "
            "vehicles is overpaying on cellular data plans by 18–30% compared to "
            "what's negotiable today — mostly because carriers don't proactively reprice.\n\n"
            "I put those contracts out to bid for you. Happy to take a look "
            "at what {{company | your business}} is currently paying.\n\nBurke\nThe Interesting Group"
        ),
        "proof_subject": "what we saved a Texas freight company",
        "proof_body": (
            "Hi {{first_name | there}},\n\n"
            "Quick example: worked with a regional freight operator last year. "
            "They had three separate mobile carriers across their fleet — "
            "no one had ever consolidated. We ran a competitive bid, "
            "moved to one provider, and cut their monthly spend by 22%.\n\n"
            "Worth seeing if there's a similar opportunity at {{company | your business}}.\n\nBurke"
        ),
        "redirect_subject": "wrong person?",
        "redirect_body": (
            "Hi {{first_name | there}},\n\n"
            "I've reached out a few times about tech vendor management for {{company | your business}}. "
            "If this isn't your area, no problem — who's the right person to connect with?\n\nBurke"
        ),
    },

    # ── Default / SMB General ─────────────────────────────────────────────────
    "default": {
        "subject_a": "tech vendors for {{company | your business}} — quick question",
        "subject_b": "managing technology at {{company | your business}}",
        "body_a": (
            "Hi {{first_name | there}},\n\n"
            "As the person running {{company | your business}}, you're probably also the one "
            "managing tech vendors — phone systems, internet, cloud — on top of everything else.\n\n"
            "I'm Burke Ruder, founder of The Interesting Group in Buda, TX. "
            "I work with businesses as an outside tech procurement resource. "
            "Vendor selection, negotiation, account management. "
            "I'm paid by the vendors — no cost to you.\n\n"
            "Worth a 15-minute call?\n\nBurke\nThe Interesting Group | burke@theinterestinggroup.com | https://theinterestinggroup.com?utm_source=instantly&utm_medium=email&utm_campaign={{industry}}"
        ),
        "body_b": (
            "Hi {{first_name | there}},\n\n"
            "Most business owners I work with are overpaying on at least "
            "one technology contract — not because they made a bad decision, "
            "but because there was never time to look.\n\n"
            "I handle tech procurement for companies like {{company | your business}} — at no cost to you. "
            "Open to a quick conversation?\n\nBurke\nThe Interesting Group"
        ),
        "followup_a": (
            "Hi {{first_name | there}},\n\nFollowing up on my last note. "
            "If managing tech vendors is something you'd like help with, "
            "happy to connect.\n\nBurke"
        ),
        "followup_b": (
            "Hi {{first_name | there}},\n\nStill happy to connect. "
            "Even a quick look at your current vendor contracts "
            "often surfaces savings. No obligation.\n\nBurke"
        ),
        "value_subject": "one number worth knowing",
        "value_body": (
            "Hi {{first_name | there}},\n\n"
            "Stat from our work across Texas businesses: "
            "companies with under 100 employees overpay on technology contracts "
            "by an average of 20–30% — mostly on phone systems and internet, "
            "where auto-renewals quietly inflate the bill each year.\n\n"
            "I audit that for free and bring you market-rate options. "
            "Even if you decide not to switch, you'll know where you stand.\n\nBurke\nThe Interesting Group"
        ),
        "proof_subject": "what we typically find",
        "proof_body": (
            "Hi {{first_name | there}},\n\n"
            "Most businesses I work with find savings in one of three places: "
            "an internet contract that hasn't been rebid in 3+ years, "
            "a phone system with more lines than they need, "
            "or a cloud solution they're paying for but not fully using.\n\n"
            "I do a quick audit — no cost — and tell you honestly what I find. "
            "Happy to do that for {{company | your business}} if you're open to it.\n\nBurke"
        ),
        "redirect_subject": "wrong person?",
        "redirect_body": (
            "Hi {{first_name | there}},\n\n"
            "I've reached out a few times and haven't heard back — "
            "totally fine if the timing is off or this isn't your area. "
            "If someone else at {{company | your business}} handles vendor decisions, "
            "I'd appreciate the introduction.\n\nBurke"
        ),
    },


    # ══════════════════════════════════════════════════════════════════════════
    # TRACK 2 — ENTERPRISE  (builds the wealth)
    # ══════════════════════════════════════════════════════════════════════════

    # ── CCaaS / Contact Center ────────────────────────────────────────────────
    # Target: VP Customer Experience, Director Contact Center, VP Operations,
    #         VP IT — at companies with 100–2,000 employees that run inbound
    #         call centers (insurance, healthcare, financial services, retail,
    #         logistics with large dispatch operations)
    # Angle:  Legacy contact center pain → cloud migration → massive ROI
    # Avg deal: $20k–$200k MRR | Commission: $2k–$20k/mo recurring
    "ccaas": {
        "subject_a": "is {{company | your business}}'s contact center still on-prem?",
        "subject_b": "contact center question for {{first_name | there}}",
        "body_a": (
            "Hi {{first_name | there}},\n\n"
            "I'll be direct: if {{company | your business}} is still running an on-premise contact center, "
            "you're likely overpaying by 40–60% compared to cloud alternatives — "
            "and leaving AI-powered agent tools on the table that your competitors are already using.\n\n"
            "I'm Burke Ruder with The Interesting Group. I'm an independent technology advisor — "
            "I represent 200+ vendors including Five9, Genesys, NICE CXone, and Talkdesk, "
            "which means I can show you an honest comparison instead of a single vendor pitch.\n\n"
            "Is a 20-minute conversation worth it to see where you stand?\n\n"
            "Burke\nThe Interesting Group | burke@theinterestinggroup.com | https://theinterestinggroup.com?utm_source=instantly&utm_medium=email&utm_campaign={{industry}}"
        ),
        "body_b": (
            "Hi {{first_name | there}},\n\n"
            "Quick question: when {{company | your business}}'s contact center contract comes up for renewal, "
            "do you have someone running a competitive evaluation — or does the incumbent "
            "usually just get renewed?\n\n"
            "I work with mid-market companies as an independent CCaaS advisor. "
            "I represent the full market (Five9, Genesys, NICE, Talkdesk, and others), "
            "so my job is finding the best fit for your operation — not pushing one platform.\n\n"
            "Worth a quick call?\n\nBurke\nThe Interesting Group"
        ),
        "followup_a": (
            "Hi {{first_name | there}},\n\n"
            "Following up on my note about your contact center. "
            "Even if you're mid-contract, it costs nothing to benchmark where you are "
            "against current market options — and most companies I work with find "
            "significant room to improve before their next renewal.\n\nBurke"
        ),
        "followup_b": (
            "Hi {{first_name | there}},\n\n"
            "One more thought: the contact center space has moved faster in the last "
            "2 years than the previous 10 — AI agent assist, omnichannel routing, "
            "workforce management. If your platform is more than 3 years old, "
            "the gap is bigger than you might think.\n\n"
            "Happy to do a quick capabilities gap assessment. No obligation.\n\nBurke"
        ),
        "value_subject": "what mid-market contact centers are spending vs. should be",
        "value_body": (
            "Hi {{first_name | there}},\n\n"
            "Some data worth having: mid-market contact centers (50–500 agents) "
            "that migrated from on-prem to cloud CCaaS in 2023–2025 reported:\n\n"
            "  • 35–50% reduction in total cost of ownership\n"
            "  • 28% improvement in first-call resolution (AI assist)\n"
            "  • 40% reduction in agent onboarding time\n\n"
            "The caveat: results vary significantly by vendor and how the migration "
            "is scoped. That's exactly the evaluation I run for companies like {{company | your business}}.\n\n"
            "Worth 20 minutes to look at your specific situation?\n\nBurke\nThe Interesting Group"
        ),
        "proof_subject": "CCaaS migration — what we actually see",
        "proof_body": (
            "Hi {{first_name | there}},\n\n"
            "Recent example: worked with an insurance company (180 agents) "
            "that had been on the same on-prem system for 9 years. "
            "Their renewal quote came in 18% higher. We ran a 6-vendor evaluation, "
            "moved them to cloud CCaaS, and landed them at 34% below their old contract — "
            "with AI agent assist included.\n\n"
            "I can do the same evaluation for {{company | your business}}. "
            "It's free to you — I'm compensated by whichever vendor you choose.\n\nBurke"
        ),
        "redirect_subject": "is there a better person to speak with?",
        "redirect_body": (
            "Hi {{first_name | there}},\n\n"
            "I've reached out a few times about contact center modernization at {{company | your business}}. "
            "If this isn't your area of ownership, I completely understand — "
            "could you point me to the right person? "
            "VP of Operations, IT, or whoever owns your customer experience technology "
            "would be the right fit.\n\nAppreciate it.\n\nBurke"
        ),
    },

    # ── Enterprise Security / SASE / Cloudflare One ───────────────────────────
    # Target: CISO, VP IT, Director IT, Director IT Security, CTO
    #         at companies with 100–2,000 employees across all industries
    # Angle:  Zero Trust / SASE modernization, Cloudflare One, hybrid workforce
    #         security gaps — this is Burke's strongest product knowledge
    # Avg deal: $15k–$150k MRR | Commission: $1.5k–$15k/mo recurring
    "enterprise_security": {
        "subject_a": "Zero Trust at {{company | your business}} — where are you?",
        "subject_b": "quick security posture question, {{first_name | there}}",
        "body_a": (
            "Hi {{first_name | there}},\n\n"
            "With hybrid work now the default, most mid-market IT teams I talk to "
            "are somewhere in the middle of a Zero Trust journey — "
            "past VPN-only, but not yet fully SASE. Sound familiar?\n\n"
            "I'm Burke Ruder with The Interesting Group. I'm an independent technology advisor "
            "specializing in network security and SASE — I represent Cloudflare One, "
            "Zscaler, Cato Networks, and others, so I can give you an objective view "
            "of where {{company | your business}} stands and what the fastest path forward looks like.\n\n"
            "Worth 20 minutes?\n\nBurke\nThe Interesting Group | burke@theinterestinggroup.com | https://theinterestinggroup.com?utm_source=instantly&utm_medium=email&utm_campaign={{industry}}"
        ),
        "body_b": (
            "Hi {{first_name | there}},\n\n"
            "Quick question: how is {{company | your business}} handling secure access for remote and "
            "hybrid employees right now — legacy VPN, ZTNA, or something in between?\n\n"
            "I work with mid-market IT teams as an independent SASE advisor. "
            "I represent the full market (Cloudflare One, Zscaler, Cato, Versa) — "
            "no vendor bias, just a frank assessment of what fits your environment.\n\n"
            "Open to a short call?\n\nBurke\nThe Interesting Group"
        ),
        "followup_a": (
            "Hi {{first_name | there}},\n\n"
            "Following up on my note about your network security posture. "
            "If you're evaluating SASE or Zero Trust options this year — "
            "or want a second opinion on what you already have — "
            "I'm happy to run through it with you. No sales agenda.\n\nBurke"
        ),
        "followup_b": (
            "Hi {{first_name | there}},\n\n"
            "One more thought: Cloudflare One specifically has become a strong option "
            "for mid-market teams because it consolidates ZTNA, SWG, CASB, and DDoS "
            "into one platform at a price point that used to require 3 separate vendors.\n\n"
            "Happy to show you how it compares to what {{company | your business}} is currently running.\n\nBurke"
        ),
        "value_subject": "the SASE consolidation math — mid-market numbers",
        "value_body": (
            "Hi {{first_name | there}},\n\n"
            "Numbers from companies I've worked with that consolidated to SASE:\n\n"
            "  • Average of 3.2 point-security products eliminated\n"
            "  • 25–40% reduction in total network security spend\n"
            "  • Mean time to contain a breach: down 60% (Cloudflare internal data)\n\n"
            "The consolidation story is compelling, but vendor selection matters a lot — "
            "Cloudflare, Zscaler, and Cato each have meaningful differences "
            "depending on your architecture.\n\n"
            "Happy to walk through what fits {{company | your business}}.\n\nBurke\nThe Interesting Group"
        ),
        "proof_subject": "SASE migration — what we actually deployed",
        "proof_body": (
            "Hi {{first_name | there}},\n\n"
            "Recent example: worked with a financial services firm (320 employees, "
            "hybrid workforce) that was running legacy VPN + 4 separate security vendors. "
            "We evaluated the full SASE market and deployed Cloudflare One — "
            "consolidated to one platform, cut their security stack spend by 31%, "
            "and went fully Zero Trust in under 90 days.\n\n"
            "I can run the same evaluation for {{company | your business}}. "
            "I'm paid by the vendors so there's no cost to you.\n\nBurke"
        ),
        "redirect_subject": "is there a better person to speak with?",
        "redirect_body": (
            "Hi {{first_name | there}},\n\n"
            "I've reached out a few times about network security and SASE for {{company | your business}}. "
            "If this sits with someone else — CISO, IT Director, or your security team lead — "
            "I'd appreciate the introduction.\n\n"
            "Either way, thanks for your time.\n\nBurke"
        ),
    },
}


# ── Breakup email (Step 6) — same for all tracks ──────────────────────────────
# Research: breakup emails average 2-3x reply rate of earlier steps (Lemlist)
BREAKUP_SUBJECT = "should I close your file?"
BREAKUP_EMAIL = (
    "Hi {{first_name | there}},\n\n"
    "I've reached out a few times — I'll take the hint.\n\n"
    "I'm going to close out my notes on {{company | your business}} unless I hear otherwise. "
    "If the timing is ever right to talk, you know where to find me.\n\n"
    "Burke\nburke@theinterestinggroup.com | https://theinterestinggroup.com?utm_source=instantly&utm_medium=email&utm_campaign={{industry}}"
)


# ── Industry / track detection ─────────────────────────────────────────────────

# Company size thresholds (employees) for enterprise routing
ENTERPRISE_MIN_EMPLOYEES = 100

def _detect_industry(company: str, employees: int = 0, title: str = "") -> str:
    """
    Route prospect to the right campaign track.

    Enterprise track triggers:
      - Company size >= 100 employees AND title suggests IT/CX/Ops leader
        → ccaas (if CX/Ops/contact center signals) or enterprise_security (if IT/security)
    SMB track:
      - Under 100 employees, or no employee data → construction / healthcare / logistics / default
    """
    c = (company or "").lower()
    t = (title or "").lower()

    # ── Enterprise routing ────────────────────────────────────────────────────
    if employees >= ENTERPRISE_MIN_EMPLOYEES:
        # CX / Contact Center / Operations → CCaaS
        ccaas_title_signals = [
            "customer experience", "contact center", "call center",
            "cx ", "vp operations", "chief operating", "coo",
            "customer service", "customer success", "customer care",
        ]
        if any(s in t for s in ccaas_title_signals):
            return "ccaas"

        # IT / Security → Enterprise Security
        security_title_signals = [
            "ciso", "chief information security", "it director", "director of it",
            "vp it", "vp of it", "head of it", "it manager", "infrastructure",
            "network", "security", "cto", "chief technology", "sase", "zero trust",
        ]
        if any(s in t for s in security_title_signals):
            return "enterprise_security"

        # Generic enterprise IT/Ops — default to CCaaS (higher commission, higher need)
        enterprise_generic_signals = ["vp", "director", "chief", "head of", "president", "cfo", "ceo"]
        if any(s in t for s in enterprise_generic_signals):
            return "ccaas"

    # ── SMB routing ───────────────────────────────────────────────────────────
    if any(w in c for w in ["construct", "build", "contractor", "plumb", "electric", "hvac", "roofing"]):
        return "construction"
    if any(w in c for w in ["health", "clinic", "dental", "medical", "care", "therapy"]):
        return "healthcare"
    if any(w in c for w in ["transport", "logistic", "freight", "trucking", "delivery", "fleet"]):
        return "logistics"
    return "default"


# ── Apollo sequence builder (used if Apollo sequences are needed) ──────────────

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
    """Add an email step. Returns (step_id, template_id)."""
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
    """Add a second email variant to a step for A/B testing."""
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

    requests.post(
        f"{BASE_URL}/emailer_touches",
        headers=HEADERS,
        json={
            "emailer_step_id": step_id,
            "emailer_template_id": template_id,
            "type": "new_thread",
        },
    )
    return template_id


def build_sequence_for_industry(industry: str) -> str:
    """
    Build a full 6-step sequence for a given industry/track.
    Returns the Apollo sequence ID.
    """
    variants = AB_VARIANTS.get(industry, AB_VARIANTS["default"])

    track = "Enterprise" if industry in ("ccaas", "enterprise_security") else "SMB"
    seq_name = f"TIG — {industry.replace('_', ' ').title()} [{track}]"

    print(f"\nBuilding sequence: {seq_name}")
    seq_id = create_sequence(seq_name, industry)

    print("  Adding Step 1: Hook — cold email (Day 0, A/B test)")
    step1_id, _ = add_email_step(seq_id, 0, 1, variants["subject_a"], variants["body_a"])
    add_ab_variant(step1_id, variants["subject_b"], variants["body_b"])

    print("  Adding Step 2: Follow-up (Day 3, A/B body)")
    step2_id, _ = add_email_step(seq_id, 3, 2, "Re:", variants["followup_a"])
    add_ab_variant(step2_id, "Re:", variants["followup_b"])

    print("  Adding Step 3: Value-add (Day 7)")
    add_email_step(seq_id, 7, 3, variants["value_subject"], variants["value_body"])

    print("  Adding Step 4: Social proof (Day 14)")
    add_email_step(seq_id, 14, 4, variants["proof_subject"], variants["proof_body"])

    print("  Adding Step 5: Right person check (Day 21)")
    add_email_step(seq_id, 21, 5, variants["redirect_subject"], variants["redirect_body"])

    print("  Adding Step 6: Breakup email (Day 30)")
    add_email_step(seq_id, 30, 6, BREAKUP_SUBJECT, BREAKUP_EMAIL)

    print(f"  ✓ {seq_name} built (6 steps, 30 days)")
    return seq_id


def enroll_contact(sequence_id: str, apollo_contact_id: str, prospect: dict,
                   email_account_id: str) -> bool:
    """Enroll a contact into an Apollo sequence after disqualification check."""
    from scoring_agent import is_disqualified
    disqualified, reason = is_disqualified(prospect)
    if disqualified:
        print(f"  ✗ BLOCKED: {prospect.get('first_name')} @ {prospect.get('company')} — {reason}")
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
    resp = requests.get(f"{BASE_URL}/emailer_campaigns/{sequence_id}", headers=HEADERS)
    resp.raise_for_status()
    campaign = resp.json().get("emailer_campaign", {})
    return {
        "name":             campaign.get("name"),
        "open_rate":        campaign.get("open_rate"),
        "reply_rate":       campaign.get("reply_rate"),
        "bounce_rate":      campaign.get("bounce_rate"),
        "unique_delivered": campaign.get("unique_delivered"),
        "unique_replied":   campaign.get("unique_replied"),
    }


def build_all_sequences() -> dict:
    """Build sequences for all tracks. Returns {industry: sequence_id}."""
    industries = [
        # SMB track
        "construction", "healthcare", "logistics", "default",
        # Enterprise track
        "ccaas", "enterprise_security",
    ]
    sequence_map = {}

    print("\n" + "=" * 60)
    print("BUILDING TIG SEQUENCES — TWO-TRACK STRATEGY")
    print("  Track 1 (SMB):        construction, healthcare, logistics, default")
    print("  Track 2 (Enterprise): ccaas, enterprise_security")
    print("=" * 60)

    for industry in industries:
        try:
            seq_id = build_sequence_for_industry(industry)
            sequence_map[industry] = seq_id
        except Exception as e:
            print(f"  ERROR building {industry} sequence: {e}")

    os.makedirs("output", exist_ok=True)
    with open("output/sequence_ids.json", "w") as f:
        json.dump(sequence_map, f, indent=2)

    print(f"\n✓ All sequences built. IDs saved to output/sequence_ids.json")
    return sequence_map


if __name__ == "__main__":
    import sys
    if "--stats" in sys.argv:
        try:
            with open("output/sequence_ids.json") as f:
                seq_map = json.load(f)
            print("\nSEQUENCE PERFORMANCE REPORT")
            print("=" * 60)
            for industry, seq_id in seq_map.items():
                stats = get_sequence_stats(seq_id)
                track = "Enterprise" if industry in ("ccaas", "enterprise_security") else "SMB"
                print(f"\n[{track}] {stats['name']}")
                print(f"  Delivered: {stats['unique_delivered']}")
                print(f"  Open rate: {stats['open_rate']}")
                print(f"  Reply rate: {stats['reply_rate']}")
                print(f"  Bounce rate: {stats['bounce_rate']}")
        except FileNotFoundError:
            print("No sequences built yet.")
    else:
        build_all_sequences()
