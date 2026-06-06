"""
Outreach Drafting Agent
Template-based cold email generator. No API costs.
Angle: Burke handles tech procurement so the owner doesn't have to.
Avoids: cybersecurity (Cloudflare conflict).
Focus: UCaaS, SD-WAN/connectivity, cloud infrastructure, CCaaS — highest Sandler margins.
"""


# --- Product angle detection ---

def _get_product_angle(company: str) -> dict:
    """Map company name keywords to a product angle and pain point."""
    c = (company or "").lower()

    if any(w in c for w in ["construct", "build", "contractor", "plumb", "electric", "hvac", "roofing"]):
        return {
            "product": "SD-WAN and mobile connectivity",
            "pain": "keeping field teams and the office connected reliably",
            "benefit": "one contract, one vendor, no dropped balls when a job site goes dark",
        }
    if any(w in c for w in ["health", "clinic", "dental", "medical", "care", "therapy", "chiro"]):
        return {
            "product": "UCaaS with HIPAA-compliant options",
            "pain": "managing patient communications across multiple locations or providers",
            "benefit": "modern phone and messaging that actually meets compliance requirements",
        }
    if any(w in c for w in ["transport", "logistic", "freight", "trucking", "delivery", "fleet"]):
        return {
            "product": "IoT mobile connectivity and SD-WAN",
            "pain": "keeping dispatch and drivers connected without overpaying on cellular plans",
            "benefit": "centralized vendor management for fleet connectivity — one bill, one contact",
        }
    if any(w in c for w in ["law", "legal", "attorney", "counsel"]):
        return {
            "product": "UCaaS and cloud infrastructure",
            "pain": "aging phone systems and document infrastructure that slow the firm down",
            "benefit": "modern communications stack without the IT overhead",
        }
    if any(w in c for w in ["staffing", "recruit", "talent", "hr"]):
        return {
            "product": "UCaaS and CCaaS",
            "pain": "high call volume with no real contact center tooling",
            "benefit": "purpose-built communications for candidate and client outreach at scale",
        }
    if any(w in c for w in ["restaurant", "food", "cafe", "brew", "catering"]):
        return {
            "product": "reliable business internet and UCaaS",
            "pain": "point-of-sale and communications going down at the worst possible time",
            "benefit": "redundant connectivity so a provider outage doesn't cost you a dinner service",
        }

    # Default
    return {
        "product": "UCaaS and SD-WAN",
        "pain": "managing multiple technology vendors and contracts without dedicated IT staff",
        "benefit": "one trusted advisor to handle vendor selection, negotiation, and ongoing management",
    }


# --- Email templates ---

TEMPLATES = {
    "cold_email": {
        "subject": "tech procurement for {company}",
        "body": (
            "Hi {first_name},\n\n"
            "Running {company} keeps you busy enough — {pain} "
            "probably isn't where you want to spend your time.\n\n"
            "I'm Burke Ruder, founder of The Interesting Group out of Buda, TX. "
            "I work with small businesses as an outside procurement resource for technology — "
            "vendor evaluation, contract negotiation, and ongoing management. "
            "No cost to you; suppliers pay my fee through Sandler Partners.\n\n"
            "Worth a 15-minute call to see if I can simplify things on the {product} side?\n\n"
            "Burke\n"
            "The Interesting Group | Buda, TX\n"
            "burke.ruder@gmail.com"
        ),
    },
    "linkedin_note": (
        "Hi {first_name} — I help small TX businesses with tech procurement "
        "(vendor selection, negotiation, management) at no cost to them. "
        "Thought it might be worth connecting."
    ),
    "follow_up": {
        "subject": "Re: tech procurement for {company}",
        "body": (
            "Hi {first_name},\n\n"
            "Wanted to follow up on my last note. "
            "If {pain} is something you're dealing with, I may be able to help — "
            "no pitch, just a quick conversation.\n\n"
            "Happy to work around your schedule.\n\n"
            "Burke"
        ),
    },
}


def draft_outreach(prospect: dict) -> dict:
    """
    Generate templated outreach for a single prospect.
    Returns the prospect dict with outreach fields added.
    """
    first_name = prospect.get("first_name", "there")
    company = prospect.get("company", "your company")
    angle = _get_product_angle(company)

    ctx = {
        "first_name": first_name,
        "company": company,
        "product": angle["product"],
        "pain": angle["pain"],
        "benefit": angle["benefit"],
    }

    outreach = {
        "subject": TEMPLATES["cold_email"]["subject"].format(**ctx),
        "body": TEMPLATES["cold_email"]["body"].format(**ctx),
        "linkedin_note": TEMPLATES["linkedin_note"].format(**ctx),
        "follow_up_subject": TEMPLATES["follow_up"]["subject"].format(**ctx),
        "follow_up_body": TEMPLATES["follow_up"]["body"].format(**ctx),
        "product_angle": angle["product"],
    }

    return {**prospect, "outreach": outreach}


def draft_all(prospects: list, tier_filter: str = "A") -> list:
    """Draft outreach for all prospects at the given tier."""
    filtered = [p for p in prospects if p.get("tier") == tier_filter]
    print(f"\nDrafting outreach for {len(filtered)} {tier_filter}-tier prospects...")

    results = [draft_outreach(p) for p in filtered]
    print(f"  Done — {len(results)} emails ready for review")
    return results


if __name__ == "__main__":
    import json

    mock = {
        "id": "1",
        "first_name": "Carlos",
        "title": "CEO",
        "company": "Lone Star Construction",
        "has_email": True,
        "has_phone": True,
        "score": 65,
        "tier": "A",
    }

    result = draft_outreach(mock)
    print("=== COLD EMAIL ===")
    print(f"Subject: {result['outreach']['subject']}\n")
    print(result['outreach']['body'])
    print("\n=== LINKEDIN NOTE ===")
    print(result['outreach']['linkedin_note'])
    print("\n=== FOLLOW-UP ===")
    print(f"Subject: {result['outreach']['follow_up_subject']}\n")
    print(result['outreach']['follow_up_body'])
