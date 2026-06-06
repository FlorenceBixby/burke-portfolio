"""
Prospect Scoring Agent
Scores Apollo prospects before spending credits to reveal them.
Prioritizes companies most likely to need outside tech procurement help.
"""


# ── Disqualification filters ─────────────────────────────────────────────────

# Company name keywords that indicate government, public sector, or education
# These require RFPs, procurement committees, and slow payment — skip them
DISQUALIFIED_COMPANY_KEYWORDS = {
    # Government
    "city of", "county of", "state of", "department of", "office of",
    "united states", "u.s. ", "federal", "municipal", "government",
    "public works", "transit authority", "water authority", "port of",
    "housing authority", "chamber of commerce",
    # Education
    "school", "academy", "university", "college", "institute",
    "isd", "independent school district", "school district",
    "community college", "charter school", "montessori",
    "elementary", "middle school", "high school",
    # Nonprofit / public adjacent
    "nonprofit", "non-profit", "foundation", "campaign for",
    "public library", "library system",
}

# Title keywords that indicate a public sector role
DISQUALIFIED_TITLE_KEYWORDS = {
    "superintendent", "school principal", "provost", "chancellor",
    "city manager", "county manager", "alderman", "commissioner",
    "district director", "public affairs",
}


def is_disqualified(prospect: dict) -> tuple:
    """
    Returns (True, reason) if the prospect should be skipped entirely.
    Returns (False, '') if the prospect is eligible.
    """
    company = (prospect.get("company") or "").lower()
    title = (prospect.get("title") or "").lower()

    for keyword in DISQUALIFIED_COMPANY_KEYWORDS:
        if keyword in company:
            return True, f"Public/govt/education company: '{keyword}' in '{prospect.get('company')}'"

    for keyword in DISQUALIFIED_TITLE_KEYWORDS:
        if keyword in title:
            return True, f"Public sector title: '{keyword}' in '{prospect.get('title')}'"

    return False, ""


# ── Scoring ───────────────────────────────────────────────────────────────────

# Titles that signal the person IS the decision maker with no procurement support
HIGH_VALUE_TITLES = {
    "ceo", "chief executive officer", "owner", "president", "founder",
    "co-founder", "managing director", "managing partner",
}

MEDIUM_VALUE_TITLES = {
    "coo", "chief operating officer", "director of operations",
    "vp of operations", "vice president of operations",
    "office manager", "business manager", "general manager",
}

# IT titles are good but imply some tech function already exists
IT_TITLES = {
    "it manager", "director of it", "it director", "systems administrator",
    "network administrator", "it coordinator",
}

# Industries with high tech spend and low procurement sophistication
HIGH_PRIORITY_INDUSTRIES = {
    "construction", "healthcare", "logistics", "transportation",
    "staffing", "real estate", "manufacturing",
}

MEDIUM_PRIORITY_INDUSTRIES = {
    "professional services", "legal", "accounting", "insurance",
    "consulting", "financial services",
}

# Tech companies likely have internal procurement — lower priority
LOWER_PRIORITY_INDUSTRIES = {
    "technology", "software", "saas",
}


def score_title(title: str) -> tuple[int, str]:
    title_lower = title.lower() if title else ""

    for t in HIGH_VALUE_TITLES:
        if t in title_lower:
            return 40, f"Top decision maker ({title})"

    for t in MEDIUM_VALUE_TITLES:
        if t in title_lower:
            return 25, f"Operations decision maker ({title})"

    for t in IT_TITLES:
        if t in title_lower:
            return 15, f"IT function exists but likely no procurement ({title})"

    return 5, f"Unknown title ({title})"


def score_contact_data(prospect: dict) -> tuple[int, str]:
    """More contact data available = higher confidence we can reach them."""
    score = 0
    reasons = []

    if prospect.get("has_email"):
        score += 15
        reasons.append("has email")
    if prospect.get("has_phone"):
        score += 10
        reasons.append("has direct phone")

    return score, ", ".join(reasons) if reasons else "no contact data"


def score_company(prospect: dict) -> tuple[int, str]:
    score = 0
    reasons = []

    if prospect.get("has_revenue"):
        score += 10
        reasons.append("revenue data available")
    if prospect.get("has_employee_count"):
        score += 5
        reasons.append("employee count available")

    return score, ", ".join(reasons) if reasons else "limited company data"


def score_prospect(prospect: dict) -> dict:
    """
    Score a prospect on a 0-100 scale.
    Returns the prospect dict with score, tier, and reasoning added.
    Automatically disqualifies government, school, and public sector prospects.
    """
    # Hard disqualification — no score needed
    disqualified, reason = is_disqualified(prospect)
    if disqualified:
        return {
            **prospect,
            "score": 0,
            "tier": "DQ",
            "recommendation": f"Disqualified — {reason}",
            "score_breakdown": {"disqualified": reason},
        }

    title_score, title_reason = score_title(prospect.get("title", ""))
    contact_score, contact_reason = score_contact_data(prospect)
    company_score, company_reason = score_company(prospect)

    total = title_score + contact_score + company_score

    if total >= 55:
        tier = "A"
        recommendation = "Reveal contact and prioritize outreach"
    elif total >= 35:
        tier = "B"
        recommendation = "Reveal contact if credits allow"
    else:
        tier = "C"
        recommendation = "Skip — insufficient data or low-value title"

    return {
        **prospect,
        "score": total,
        "tier": tier,
        "recommendation": recommendation,
        "score_breakdown": {
            "title": f"{title_score} — {title_reason}",
            "contact_data": f"{contact_score} — {contact_reason}",
            "company_data": f"{company_score} — {company_reason}",
        },
    }


def score_all(prospects: list) -> list:
    """Score and sort a list of prospects. Returns A/B tiers first."""
    scored = [score_prospect(p) for p in prospects]
    scored.sort(key=lambda x: x["score"], reverse=True)

    a_tier = [p for p in scored if p["tier"] == "A"]
    b_tier = [p for p in scored if p["tier"] == "B"]
    c_tier = [p for p in scored if p["tier"] == "C"]
    dq = [p for p in scored if p["tier"] == "DQ"]

    print(f"Scoring complete:")
    print(f"  A tier (reveal now):   {len(a_tier)}")
    print(f"  B tier (reveal later): {len(b_tier)}")
    print(f"  C tier (skip):         {len(c_tier)}")
    if dq:
        print(f"  Disqualified (govt/school/public): {len(dq)}")
        for p in dq[:3]:
            print(f"    ✗ {p.get('first_name')} @ {p.get('company')}")

    # Return only non-DQ prospects to the pipeline
    return [p for p in scored if p["tier"] != "DQ"]


if __name__ == "__main__":
    import json

    # Test with mock data
    mock = [
        {"id": "1", "first_name": "John", "title": "CEO", "company": "Acme Construction",
         "has_email": True, "has_phone": True, "has_revenue": True, "has_employee_count": True},
        {"id": "2", "first_name": "Sarah", "title": "IT Manager", "company": "Tech Co",
         "has_email": True, "has_phone": False, "has_revenue": False, "has_employee_count": True},
        {"id": "3", "first_name": "Mike", "title": "Office Manager", "company": "Law Firm LLC",
         "has_email": False, "has_phone": False, "has_revenue": False, "has_employee_count": False},
    ]

    results = score_all(mock)
    print(json.dumps(results, indent=2))
