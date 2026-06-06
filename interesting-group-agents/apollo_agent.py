"""
Apollo Search Agent
Finds small, fast-growing companies in the Austin/San Antonio corridor
whose decision makers are handling tech procurement themselves.
"""

import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

APOLLO_API_KEY = os.getenv("APOLLO_API_KEY")
BASE_URL = "https://api.apollo.io/api/v1"
HEADERS = {
    "Content-Type": "application/json",
    "X-Api-Key": APOLLO_API_KEY,
}

# Decision maker titles at small companies with no procurement function
TARGET_TITLES = [
    "CEO",
    "Chief Executive Officer",
    "Owner",
    "President",
    "COO",
    "Chief Operating Officer",
    "Director of Operations",
    "Office Manager",
    "Business Manager",
    "IT Manager",
    "Director of IT",
]

# I-35 corridor: Austin to San Antonio
TARGET_CITIES = [
    "Austin, Texas",
    "San Antonio, Texas",
    "Round Rock, Texas",
    "Cedar Park, Texas",
    "Kyle, Texas",
    "Buda, Texas",
    "San Marcos, Texas",
    "New Braunfels, Texas",
    "Pflugerville, Texas",
    "Georgetown, Texas",
    "Leander, Texas",
]

# Industries to exclude
EXCLUDED_INDUSTRIES = [
    "oil & gas",
    "oil and gas",
    "energy",
    "mining",
]

# Fast-growing industry verticals — good fit for a VAR
TARGET_INDUSTRIES = [
    "construction",
    "healthcare",
    "logistics",
    "transportation",
    "professional services",
    "legal",
    "accounting",
    "insurance",
    "real estate",
    "manufacturing",
    "technology",
    "software",
    "staffing",
    "consulting",
    "financial services",
]


def search_prospects(
    page: int = 1,
    per_page: int = 25,
    industry: str = None,
    city: str = None,
) -> dict:
    """
    Search Apollo for decision makers at small companies in the I-35 corridor.
    Paginates — pass page=2, 3, etc. to get fresh results each run.
    Returns raw API response.
    """
    payload = {
        "page": page,
        "per_page": min(per_page, 100),  # Apollo max is 100
        "person_titles": TARGET_TITLES,
        "person_locations": [city] if city else TARGET_CITIES,
        "organization_num_employees_ranges": ["1,150"],
    }

    if industry:
        payload["organization_industry_tag_ids"] = []
        payload["q_organization_industry_keywords"] = [industry]

    response = requests.post(
        f"{BASE_URL}/mixed_people/api_search",
        headers=HEADERS,
        json=payload,
    )
    response.raise_for_status()
    return response.json()


def reveal_contact(person_id: str) -> dict:
    """
    Spend a credit to reveal full contact details for a prospect.
    Only call this after scoring confirms the prospect is worth pursuing.
    """
    response = requests.post(
        f"{BASE_URL}/people/match",
        headers=HEADERS,
        json={"id": person_id, "reveal_personal_emails": False},
    )
    response.raise_for_status()
    return response.json()


def format_prospect(person: dict) -> dict:
    """Normalize Apollo response into a clean prospect record."""
    org = person.get("organization", {})
    return {
        "id": person.get("id"),
        "first_name": person.get("first_name"),
        "last_name": person.get("last_name_obfuscated", "[hidden]"),
        "title": person.get("title"),
        "has_email": person.get("has_email", False),
        "has_phone": person.get("has_direct_phone") == "Yes",
        "company": org.get("name"),
        "has_revenue": org.get("has_revenue", False),
        "has_employee_count": org.get("has_employee_count", False),
        "city": org.get("has_city"),
        "state": org.get("has_state"),
    }


def run_search(industry: str = None, city: str = None, max_results: int = 25) -> list:
    """
    Run a prospect search and return a list of formatted prospect records.
    Does NOT spend credits — returns obfuscated data for scoring first.
    """
    print(f"\nSearching Apollo...")
    print(f"  Industry filter: {industry or 'all target industries'}")
    print(f"  City filter: {city or 'all I-35 corridor cities'}")
    print(f"  Employee range: 1-150")

    data = search_prospects(per_page=max_results, industry=industry, city=city)
    people = data.get("people", [])
    total = data.get("total_entries", 0)

    print(f"  Found {total} total matches, pulling top {len(people)}\n")

    return [format_prospect(p) for p in people]


if __name__ == "__main__":
    # Quick test run
    prospects = run_search(industry="construction", city="Austin, Texas", max_results=10)
    print(json.dumps(prospects, indent=2))
