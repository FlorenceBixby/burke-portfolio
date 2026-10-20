"""
Ironman Training Calendar Sync

Pulls today's training session from the ironman-training plan feed
(https://im.burkeruder.ai/api/plan, public read-only endpoint — no
credentials needed on that side) and creates it as an event on Burke's real
PRIMARY Google calendar (burke.ruder@gmail.com's `primary` calendar) — not
the private Family Events calendar, which is reserved for family/kid events.

Reuses the same burke.ruder@gmail.com OAuth token as calendar_agent.py /
personal_mailbox_manager.py (Calendar scope already granted — see
gmail_agent.py's CALENDAR_SCOPES). No new Google OAuth app needed.

Once Bela (Burke's work chief of staff) schedules the session around the
work calendar (POST /api/session/:id/schedule), the event becomes a timed
block of the scheduled length; until then it's an all-day reminder listing
the candidate windows. Upserted by session id (calendar_agent.upsert_event),
so a reschedule moves the existing event instead of duplicating it.
Runs hourly through the day via .github/workflows/training-calendar-sync.yml.

Setup: same credentials/token files as personal_mailbox_manager.py
(gmail_credentials_personal.json / gmail_token_personal.json — see that
script's docstring for how those were created). No separate setup needed if
those already exist.
"""

import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

from calendar_agent import _get_calendar_service, upsert_event

PLAN_API = "https://im.burkeruder.ai/api/plan"

CREDENTIALS_FILE = Path(__file__).parent / "gmail_credentials_personal.json"
TOKEN_FILE = Path(__file__).parent / "gmail_token_personal.json"


def main():
    today = datetime.now(ZoneInfo("America/Chicago")).strftime("%Y-%m-%d")

    resp = requests.get(PLAN_API, params={"date": today}, timeout=30)
    resp.raise_for_status()
    sessions = resp.json().get("sessions", [])

    if not sessions:
        print(f"No session logged for {today} yet — nothing to sync.")
        return

    calendar_service = _get_calendar_service(
        credentials_path=CREDENTIALS_FILE, token_path=TOKEN_FILE
    )

    for session in sessions:
        sport = (session.get("sport") or "session").capitalize()
        sched = session.get("scheduled")
        desc = session.get("summary") or ""

        if sched:
            # Bela (work chief of staff) fit it around the work calendar:
            # timed event, at the length it actually has room for.
            minutes = sched["minutes"]
            event = {"title": f"{sport} — {minutes} min", "date": today,
                     "time": sched["start"], "minutes": minutes}
        else:
            # Not placed yet: all-day reminder listing the candidate windows.
            minutes = session.get("ideal_minutes")
            windows = ", ".join(f"{w['start']}–{w['end']}" for w in session.get("windows") or [])
            event = {"title": f"{sport} — {minutes} min" + (f" (unscheduled: {windows})" if windows else ""),
                     "date": today}
            if session.get("unscheduled_reason"):
                desc = f"No slot today: {session['unscheduled_reason']}\nFallback: {session.get('fallback') or ''}\n\n{desc}"
        event["description"] = desc

        # One event per session id — stable across re-runs, distinct if a
        # day ever has more than one session. Re-runs update it in place
        # when Bela (re)schedules.
        source_id = f"ironman-training-session-{session['id']}"
        result = upsert_event(calendar_service, "primary", event, source_id)
        print(f"{result}: {event['title']}" + (f" at {event['time']}" if event.get("time") else ""))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"training_calendar_sync failed: {exc}", file=sys.stderr)
        sys.exit(1)
