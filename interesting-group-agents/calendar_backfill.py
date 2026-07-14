"""
One-time calendar backfill.

personal_mailbox_manager.py and atxruders_mailbox_manager.py only scan
`in:inbox`, so mail archived before calendar-event extraction existed (most
of both inboxes, from earlier test runs today) was never scanned for
events. This does a one-off wider pass — last N days, across all mail, not
just inbox — purely to extract and add missing calendar events. It never
archives, labels, or drafts anything. Safe to re-run: events are
deduplicated by source Gmail message ID (see calendar_agent.py), so
already-backfilled or already-daily-processed messages are skipped, not
duplicated.

Run once by hand: python3 calendar_backfill.py
Not part of either daily workflow.
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

from gmail_agent import _get_gmail_service, _extract_body
from calendar_agent import _get_calendar_service, create_event_if_new
from mailbox_common import classify_with_claude
from anthropic import Anthropic

load_dotenv()

DAYS_BACK = 60

PERSONAL_CREDENTIALS = Path(__file__).parent / "gmail_credentials_personal.json"
PERSONAL_TOKEN = Path(__file__).parent / "gmail_token_personal.json"
ATXRUDERS_TOKEN = Path(__file__).parent / "gmail_token_atxruders.json"

FAMILY_CALENDAR_ID = os.environ.get('FAMILY_CALENDAR_ID')


def backfill_account(label: str, gmail_service, client: Anthropic, calendar_service, calendar_id: str, days: int):
    print(f'=== Backfilling {label} (last {days}d) ===')

    result = gmail_service.users().messages().list(
        userId='me', q=f'newer_than:{days}d -in:sent -in:spam -in:trash', maxResults=200
    ).execute()
    messages = result.get('messages', [])
    print(f'{label}: {len(messages)} messages in range')

    existing_labels = gmail_service.users().labels().list(userId='me').execute().get('labels', [])
    label_names = [l['name'] for l in existing_labels if l.get('type') == 'user']

    events_created = 0
    for msg in messages:
        try:
            m = gmail_service.users().messages().get(userId='me', id=msg['id'], format='full').execute()
            headers = {h['name']: h['value'] for h in m['payload']['headers']}
            sender = headers.get('From', '')
            subject = headers.get('Subject', '')
            snippet = m.get('snippet', '')
            body = _extract_body(m['payload'])

            classification = classify_with_claude(client, sender, subject, snippet, body, label_names)

            for event in classification.get('calendar_events') or []:
                if event.get('title') and event.get('date'):
                    created_id = create_event_if_new(calendar_service, calendar_id, event, source_msg_id=msg['id'])
                    if created_id:
                        events_created += 1
                        print(f'  -> {label}: {event["title"]} ({event["date"]})')
        except Exception as e:
            print(f'  {label}: skipped {msg["id"]}: {e}')

    print(f'{label}: {events_created} new calendar events created')
    return events_created


if __name__ == '__main__':
    if not FAMILY_CALENDAR_ID:
        print('FAMILY_CALENDAR_ID not set — nothing to do.')
        sys.exit(1)

    anthropic_key = os.environ['ANTHROPIC_API_KEY']
    client = Anthropic(api_key=anthropic_key)

    calendar_service = _get_calendar_service(credentials_path=PERSONAL_CREDENTIALS, token_path=PERSONAL_TOKEN)

    total = 0
    personal_service = _get_gmail_service(credentials_path=PERSONAL_CREDENTIALS, token_path=PERSONAL_TOKEN)
    total += backfill_account('personal', personal_service, client, calendar_service, FAMILY_CALENDAR_ID, DAYS_BACK)

    atxruders_service = _get_gmail_service(credentials_path=PERSONAL_CREDENTIALS, token_path=ATXRUDERS_TOKEN)
    total += backfill_account('atxruders', atxruders_service, client, calendar_service, FAMILY_CALENDAR_ID, DAYS_BACK)

    print(f'=== Backfill done — {total} total events created ===')
