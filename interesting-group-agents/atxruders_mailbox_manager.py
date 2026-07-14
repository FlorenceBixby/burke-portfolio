"""
atxruders Mailbox Manager — atxruders@gmail.com (Burke + his wife's shared
family inbox). Runs daily. Same triage/archive/draft logic as
personal_mailbox_manager.py (see mailbox_common.py), with two differences:
  - 24-hour grace period: any message younger than 24h is left completely
    untouched (no classification, label, archive, or draft), so either of
    them has a chance to see it first.
  - Extracted calendar events are written to burke.ruder@gmail.com's
    Family Events calendar — a separate authenticated Calendar service,
    since reading this shared inbox and writing to Burke's personal
    calendar are two different Google accounts.

Setup (one-time):
  1. In the "Family Calendar Sync" Google Cloud project, add
     atxruders@gmail.com as a test user on the OAuth consent screen.
  2. From this directory:
       python3 gmail_agent.py --setup \
         --credentials gmail_credentials_personal.json \
         --token gmail_token_atxruders.json
     Log in as atxruders@gmail.com. (Reuses the same OAuth client as the
     personal mailbox — Desktop app clients aren't account-bound.)
  3. burke.ruder@gmail.com's token needs Calendar scope for this script to
     write events — see personal_mailbox_manager.py's docstring if that
     hasn't been set up yet. Set FAMILY_CALENDAR_ID once the calendar
     exists.
"""

import os
from pathlib import Path

from mailbox_common import run_mailbox_manager
from calendar_agent import _get_calendar_service

CREDENTIALS_FILE = Path(__file__).parent / "gmail_credentials_personal.json"
TOKEN_FILE = Path(__file__).parent / "gmail_token_atxruders.json"
LOG_FILE = str(Path(__file__).parent / "output" / "atxruders_mailbox.log")

# Separate account (burke.ruder@gmail.com) whose Calendar we write to.
PERSONAL_CREDENTIALS_FILE = Path(__file__).parent / "gmail_credentials_personal.json"
PERSONAL_TOKEN_FILE = Path(__file__).parent / "gmail_token_personal.json"

FAMILY_CALENDAR_ID = os.environ.get('FAMILY_CALENDAR_ID')

MAILBOX_CONTEXT = (
    "This is a shared family inbox used by both Burke and his wife — "
    "either of them may be the one who needs to respond, so judge "
    "needs_response from either person's perspective."
)


if __name__ == '__main__':
    calendar_service = None
    if FAMILY_CALENDAR_ID:
        calendar_service = _get_calendar_service(
            credentials_path=PERSONAL_CREDENTIALS_FILE, token_path=PERSONAL_TOKEN_FILE
        )

    run_mailbox_manager(
        credentials_path=CREDENTIALS_FILE,
        token_path=TOKEN_FILE,
        log_path=LOG_FILE,
        mailbox_context=MAILBOX_CONTEXT,
        grace_period_hours=24,
        calendar_service=calendar_service,
        calendar_id=FAMILY_CALENDAR_ID,
    )
