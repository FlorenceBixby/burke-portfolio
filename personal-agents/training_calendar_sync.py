"""
Ironman Training Calendar Sync

Pulls today's training session from the ironman-training dashboard
(https://im.burkeruder.ai/api/dashboard, public read-only endpoint — no
credentials needed on that side) and creates it as an event on Burke's real
PRIMARY Google calendar (burke.ruder@gmail.com's `primary` calendar) — not
the private Family Events calendar, which is reserved for family/kid events.

Reuses the same burke.ruder@gmail.com OAuth token as calendar_agent.py /
personal_mailbox_manager.py (Calendar scope already granted — see
gmail_agent.py's CALENDAR_SCOPES). No new Google OAuth app needed.

Dedup: same pattern as calendar_agent.create_event_if_new — keyed by a
source id derived from the session's date, so re-runs the same day (or
after a session's details change) update cleanly instead of duplicating.
Runs daily via .github/workflows/training-calendar-sync.yml, after the
day's "today" coaching session is expected to already be in D1.

Setup: same credentials/token files as personal_mailbox_manager.py
(gmail_credentials_personal.json / gmail_token_personal.json — see that
script's docstring for how those were created). No separate setup needed if
those already exist.
"""

import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

import requests

from calendar_agent import _get_calendar_service, create_event_if_new

DASHBOARD_API = "https://im.burkeruder.ai/api/dashboard"

CREDENTIALS_FILE = Path(__file__).parent / "gmail_credentials_personal.json"
TOKEN_FILE = Path(__file__).parent / "gmail_token_personal.json"

# Central time, matching every other time reference in this workspace
# (Burke lives in Buda, TX). Good enough for "which calendar day is today" —
# doesn't need to be DST-exact for this purpose.
CENTRAL_OFFSET_HOURS = -5  # CDT; off by an hour during CST, same caveat as
                            # the other cron jobs in this repo.


def today_central_date_str() -> str:
    now_utc = datetime.now(timezone.utc)
    central = now_utc + timedelta(hours=CENTRAL_OFFSET_HOURS)
    return central.strftime("%Y-%m-%d")


def main():
    today = today_central_date_str()

    resp = requests.get(DASHBOARD_API, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    sessions = data.get("sessions", [])
    todays_sessions = [s for s in sessions if s.get("date") == today]

    if not todays_sessions:
        print(f"No session logged for {today} yet — nothing to sync.")
        return

    calendar_service = _get_calendar_service(
        credentials_path=CREDENTIALS_FILE, token_path=TOKEN_FILE
    )

    for session in todays_sessions:
        sport = (session.get("sport") or "session").capitalize()
        minutes = session.get("planned_minutes")
        slot = session.get("planned_time") or ""
        desc = session.get("planned_desc") or ""

        title = f"{sport} — {minutes} min" if minutes else sport
        if slot:
            title += f" ({slot})"

        event = {
            "title": title,
            "date": today,
            "description": desc,
        }

        # One event per session id — stable across re-runs the same day, and
        # distinct if a day ever logs more than one session.
        source_id = f"ironman-training-session-{session.get('id', today)}"

        created_id = create_event_if_new(
            calendar_service, "primary", event, source_id
        )
        if created_id:
            print(f"Created calendar event: {title}")
        else:
            print(f"Already on calendar (or duplicate skipped): {title}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"training_calendar_sync failed: {exc}", file=sys.stderr)
        sys.exit(1)
