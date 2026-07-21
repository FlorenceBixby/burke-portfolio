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

    if event.get('time'):
        start = datetime.strptime(f"{event['date']} {event['time']}", '%Y-%m-%d %H:%M')
        end = start + timedelta(hours=1)
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

    created = service.events().insert(calendarId=calendar_id, body=body).execute()
    return created['id']
