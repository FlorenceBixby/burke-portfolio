"""
Calendar Agent
Creates events on a Google Calendar, deduplicated by the source Gmail
message ID (stored in each event's private extended properties) so the
same extracted event never gets inserted twice across daily runs.
"""

from datetime import datetime, timedelta
from pathlib import Path

from gmail_agent import _get_credentials, CALENDAR_SCOPES


def _get_calendar_service(credentials_path: Path = None, token_path: Path = None):
    """Authenticate and return a Calendar API service object, reusing the
    same OAuth token file as Gmail (it just needs Calendar scope included —
    see gmail_agent.py's --calendar setup flag).
    """
    from googleapiclient.discovery import build

    creds = _get_credentials(credentials_path, token_path, scopes=CALENDAR_SCOPES)
    return build("calendar", "v3", credentials=creds)


def _event_body(event: dict, source_msg_id: str) -> dict:
    """Google Calendar body for `event` (see create_event_if_new). A timed
    event lasts `minutes` if given, else 1 hour."""
    if event.get('time'):
        start = datetime.strptime(f"{event['date']} {event['time']}", '%Y-%m-%d %H:%M')
        end = start + timedelta(minutes=event.get('minutes') or 60)
        body = {
            'start': {'dateTime': start.strftime('%Y-%m-%dT%H:%M:%S'), 'timeZone': 'America/Chicago'},
            'end': {'dateTime': end.strftime('%Y-%m-%dT%H:%M:%S'), 'timeZone': 'America/Chicago'},
        }
    else:
        start_date = datetime.strptime(event['date'], '%Y-%m-%d')
        end_date = start_date + timedelta(days=1)
        body = {
            'start': {'date': start_date.strftime('%Y-%m-%d')},
            'end': {'date': end_date.strftime('%Y-%m-%d')},
        }

    body['summary'] = event['title']
    if event.get('location'):
        body['location'] = event['location']
    if event.get('description'):
        body['description'] = event['description']
    body['extendedProperties'] = {'private': {'source_msg_id': source_msg_id}}
    return body


def upsert_event(service, calendar_id: str, event: dict, source_msg_id: str):
    """Like create_event_if_new, but if the event already exists and its
    time/title/description differ, update it in place. Returns
    'created', 'updated' or 'unchanged'."""
    existing = service.events().list(
        calendarId=calendar_id,
        privateExtendedProperty=f"source_msg_id={source_msg_id}",
        maxResults=1,
    ).execute().get('items', [])
    body = _event_body(event, source_msg_id)
    if not existing:
        service.events().insert(calendarId=calendar_id, body=body).execute()
        return 'created'
    cur = existing[0]
    same = (cur.get('summary') == body['summary']
            and (cur.get('description') or '') == (body.get('description') or '')
            and cur['start'].get('date') == body['start'].get('date')
            and (cur['start'].get('dateTime') or '')[:16] == (body['start'].get('dateTime') or '')[:16]
            and (cur['end'].get('dateTime') or '')[:16] == (body['end'].get('dateTime') or '')[:16])
    if same:
        return 'unchanged'
    # Switching all-day <-> timed needs the other start/end form cleared.
    for k in ('start', 'end'):
        body[k].setdefault('date', None)
        body[k].setdefault('dateTime', None)
    service.events().patch(calendarId=calendar_id, eventId=cur['id'], body=body).execute()
    return 'updated'


def create_event_if_new(service, calendar_id: str, event: dict, source_msg_id: str):
    """Insert `event` unless one derived from `source_msg_id` already exists
    on the calendar. `event` needs `title` and `date` (YYYY-MM-DD), and may
    include `time` (HH:MM, 24h) for a timed event, plus optional `location`
    and `description`. Returns the created event ID, or None if skipped as
    a duplicate.
    """
    existing = service.events().list(
        calendarId=calendar_id,
        privateExtendedProperty=f"source_msg_id={source_msg_id}",
        maxResults=1,
    ).execute()
    if existing.get('items'):
        return None

    body = _event_body(event, source_msg_id)
    created = service.events().insert(calendarId=calendar_id, body=body).execute()
    return created['id']
