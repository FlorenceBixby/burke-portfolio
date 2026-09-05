"""
Personal Mailbox Manager — burke.ruder@gmail.com

Calendar-only mode as of 2026-09-05: Burke found the prior full triage (auto-
archiving marketing/bills/notifications, drafting replies) was causing him to
miss real emails, and asked to drop all of that. This script now does exactly
one thing — reads the inbox and extracts calendar-worthy events onto the
Family Events calendar. It never archives, labels, or drafts anything; the
inbox is left exactly as Burke left it. atxruders_mailbox_manager.py (the
shared family inbox) is unchanged and still does the full triage — only this
mailbox was asked to change.

See mailbox_common.py's calendar_only param / extract_calendar_events_with_claude()
for the shared logic. The full triage code path (classify_with_claude, drafting,
labeling) is still there and still used by atxruders_mailbox_manager.py.

Setup (one-time):
  See gmail_agent.py's docstring for the general OAuth flow. To connect
  burke.ruder@gmail.com specifically (a second account, separate from the
  default account credentials), run from this directory:

    python3 gmail_agent.py --setup --calendar \
      --credentials gmail_credentials_personal.json \
      --token gmail_token_personal.json

  Log in as burke.ruder@gmail.com when the browser opens. The --calendar
  flag requests Calendar API scope alongside Gmail, since this script also
  writes extracted events to the Family Events calendar (set the
  FAMILY_CALENDAR_ID env var to its calendar ID once created).
"""

import os
from pathlib import Path

from mailbox_common import run_mailbox_manager
from calendar_agent import _get_calendar_service

CREDENTIALS_FILE = Path(__file__).parent / "gmail_credentials_personal.json"
TOKEN_FILE = Path(__file__).parent / "gmail_token_personal.json"
LOG_FILE = str(Path(__file__).parent / "output" / "personal_mailbox.log")

FAMILY_CALENDAR_ID = os.environ.get('FAMILY_CALENDAR_ID')


if __name__ == '__main__':
    calendar_service = None
    if FAMILY_CALENDAR_ID:
        calendar_service = _get_calendar_service(credentials_path=CREDENTIALS_FILE, token_path=TOKEN_FILE)

    run_mailbox_manager(
        credentials_path=CREDENTIALS_FILE,
        token_path=TOKEN_FILE,
        log_path=LOG_FILE,
        grace_period_hours=0,
        calendar_service=calendar_service,
        calendar_id=FAMILY_CALENDAR_ID,
        calendar_only=True,
    )
