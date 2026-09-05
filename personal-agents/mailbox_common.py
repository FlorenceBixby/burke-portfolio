"""
Shared mailbox-cleanup core, used by personal_mailbox_manager.py and
atxruders_mailbox_manager.py. Classifies each inbox message with Claude,
archives/labels non-actionable mail, drafts (never sends) replies for
threads that need one, and extracts any calendar-worthy events buried in
the email onto a destination calendar.
"""

import os
import re
import json
from datetime import datetime, timezone

from anthropic import Anthropic
from dotenv import load_dotenv

from gmail_agent import _get_gmail_service, create_threaded_draft, _extract_body
from calendar_agent import create_event_if_new

load_dotenv()

CLAUDE_MODEL = "claude-sonnet-4-6"

# Gmail system labels that aren't real user "folders" — never offered to
# Claude as an existing-label option, never created, never removed except
# INBOX (archiving).
SYSTEM_LABELS = {
    "INBOX", "SENT", "DRAFT", "TRASH", "SPAM", "STARRED", "UNREAD",
    "IMPORTANT", "CHAT",
}

# Senders where any reply must happen in their own portal/app, never by
# email — Claude gets this guidance too, but this is a hard override so a
# misclassification never produces a draft for these.
NO_REPLY_DOMAINS = [
    "onemedical.com", "care.onemedical",
]

# calendar_only mode (added 2026-09-05, personal_mailbox_manager.py) — Burke found
# the full triage below (auto-archiving marketing/bills/notifications, drafting
# replies) was causing him to miss real emails; he wants his inbox left alone now,
# with the ONLY automated action being calendar-event extraction. This prompt only
# ever asks for that one thing — no category, no archive decision, no labels, no
# draft — so a bug in this mode can't accidentally reintroduce any of that.
CALENDAR_ONLY_SYSTEM_PROMPT = """You scan one email at a time from a Gmail inbox, looking ONLY for real-world events, deadlines, or dates worth having on a personal calendar — e.g. "pajama day" buried in a school's monthly newsletter, a parent-teacher conference date, an appointment, a due date. This can be buried anywhere in the email, including fine print in a newsletter or notification that isn't otherwise about an event.

Respond with ONLY a JSON object, no other text:
{"calendar_events": [{"title": "...", "date": "YYYY-MM-DD", "time": "HH:MM" or null for all-day, "location": "..." or null, "description": "..." or null}]}
Empty list [] if nothing calendar-worthy. Today's date is __TODAY__ — resolve relative dates ("next Friday", "the 15th") against that.
"""

CLASSIFY_SYSTEM_PROMPT_HEAD = """You triage one email at a time from a Gmail inbox.__MAILBOX_CONTEXT__

For each email, decide:
1. category — one of: needs_response, marketing, bill, notification, newsletter, spam
   - needs_response: a real person is waiting for a reply BY EMAIL, or a matter needs a decision/action that an email reply can address.
   - marketing: promotional content, sales pitches, product announcements.
   - bill: statements, invoices, payment confirmations, receipts — informational, no reply needed.
   - notification: automated alerts, shipping updates, account/security notices, calendar invites already handled, portal/app messages (patient portals, bank secure messaging, etc. — anything where the real reply happens inside that service's own app/website, not by replying to the email), etc.
   - newsletter: subscribed digests/content updates.
   - spam: unsolicited junk, phishing-looking, or clearly unwanted.
   Important: if a message says "log in to view/reply" or is a notification that a portal message exists, that is notification, NOT needs_response — only draft replies for things that would actually be replied to by email.
2. archive — true unless category is needs_response (needs_response should stay visible in the inbox).
3. existing_label — the name of one label from the "Existing labels" list below if it clearly fits, else null.
4. new_label_suggestion — only if nothing existing fits AND this email is worth being able to find again later (e.g. a real bill, a warranty, a receipt worth keeping) — a short, well-organized folder name (e.g. "Bills", "Receipts", "Travel"). Prefer reusing a close existing label over creating a near-duplicate. Null for anything disposable like typical marketing/spam.
5. draft_reply — only when category is needs_response: a short, natural first-person reply, casual-professional tone, signed just the sender's first name (no company block). Leave a bracketed placeholder like [confirm date] for any detail you can't know. Null otherwise.
6. calendar_events — a list of any real-world events, deadlines, or dates-to-know mentioned ANYWHERE in the email (including fine print in newsletters, monthly calendars, or notices) that would be worth having on a personal calendar — e.g. "pajama day" buried in a school's monthly newsletter, a parent-teacher conference date, a due date, an appointment. Each item: {"title": "...", "date": "YYYY-MM-DD", "time": "HH:MM" or null for all-day, "location": "..." or null, "description": "..." or null}. Empty list [] if nothing calendar-worthy. Extract these regardless of the email's category above — a newsletter or notification can still contain real events. Today's date is __TODAY__ — resolve relative dates ("next Friday", "the 15th") against that.

Respond with ONLY a JSON object, no other text:
{"category": "...", "archive": true/false, "existing_label": "..." or null, "new_label_suggestion": "..." or null, "draft_reply": "..." or null, "calendar_events": [...]}
"""


def make_logger(log_path: str):
    def log(msg):
        ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        line = f'[{ts}] {msg}'
        print(line)
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        with open(log_path, 'a') as f:
            f.write(line + '\n')
    return log


def _thread_has_reply_or_draft(service, thread_id: str, cache: dict) -> bool:
    """True if the thread already has a sent reply or a pending draft."""
    if thread_id in cache:
        return cache[thread_id]
    thread = service.users().threads().get(
        userId='me', id=thread_id, format='metadata', metadataHeaders=[]
    ).execute()
    label_ids = set()
    for m in thread.get('messages', []):
        label_ids.update(m.get('labelIds', []))
    result = 'SENT' in label_ids or 'DRAFT' in label_ids
    cache[thread_id] = result
    return result


def classify_with_claude(client: Anthropic, sender: str, subject: str, snippet: str, body: str, label_names: list, mailbox_context: str = '') -> dict:
    system_prompt = (
        CLASSIFY_SYSTEM_PROMPT_HEAD
        .replace('__MAILBOX_CONTEXT__', f' {mailbox_context}' if mailbox_context else '')
        .replace('__TODAY__', datetime.now().strftime('%Y-%m-%d'))
    )

    labels_block = ', '.join(label_names) if label_names else '(none yet)'
    user_content = f"""Existing labels: {labels_block}

From: {sender}
Subject: {subject}
Snippet: {snippet}
Body:
{body[:3000]}
"""
    response = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=1536,
        system=system_prompt,
        messages=[{"role": "user", "content": user_content}],
    )
    text = response.content[0].text
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON found in Claude response: {text[:200]}")
    return json.loads(match.group(0))


def extract_calendar_events_with_claude(client: Anthropic, sender: str, subject: str, snippet: str, body: str) -> dict:
    """calendar_only mode's classifier — see CALENDAR_ONLY_SYSTEM_PROMPT. Never asked
    to make an archive/label/draft decision, so there's nothing here to accidentally
    apply to the inbox even if this function is called."""
    system_prompt = CALENDAR_ONLY_SYSTEM_PROMPT.replace('__TODAY__', datetime.now().strftime('%Y-%m-%d'))
    user_content = f"""From: {sender}
Subject: {subject}
Snippet: {snippet}
Body:
{body[:3000]}
"""
    response = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=768,
        system=system_prompt,
        messages=[{"role": "user", "content": user_content}],
    )
    text = response.content[0].text
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON found in Claude response: {text[:200]}")
    return json.loads(match.group(0))


def run_mailbox_manager(
    credentials_path,
    token_path,
    log_path: str,
    mailbox_context: str = '',
    grace_period_hours: float = 0,
    calendar_service=None,
    calendar_id: str = None,
    calendar_only: bool = False,
):
    """
    calendar_only=True (personal_mailbox_manager.py, 2026-09-05): does nothing but
    read the inbox and extract calendar events — no classification, no archiving,
    no labels, no drafts. The inbox is left exactly as Burke left it. Everything
    below that touches archive/label/draft state is skipped entirely in this mode,
    not just left with nothing to do — see the `if not calendar_only:` guards.
    """
    log = make_logger(log_path)
    log('=== MAILBOX MANAGER ===' + (' (calendar-only mode)' if calendar_only else ''))

    anthropic_key = os.environ['ANTHROPIC_API_KEY']
    client = Anthropic(api_key=anthropic_key)

    service = _get_gmail_service(credentials_path=credentials_path, token_path=token_path)

    label_name_to_id = {}
    label_name_to_id_lower = {}
    if not calendar_only:
        existing_labels = service.users().labels().list(userId='me').execute().get('labels', [])
        user_labels = [l for l in existing_labels if l.get('type') == 'user']
        label_name_to_id = {l['name']: l['id'] for l in user_labels}
        label_name_to_id_lower = {name.lower(): lid for name, lid in label_name_to_id.items()}

    result = service.users().messages().list(
        userId='me', labelIds=['INBOX'], maxResults=100
    ).execute()
    messages = result.get('messages', [])
    log(f'Inbox messages: {len(messages)}')

    archived = 0
    labeled = 0
    drafted = 0
    labels_created = 0
    events_created = 0
    skipped_grace = 0
    thread_reply_cache = {}
    drafted_threads = set()

    grace_period_ms = grace_period_hours * 3600 * 1000

    for msg in messages:
        sender = ''
        try:
            m = service.users().messages().get(
                userId='me', id=msg['id'], format='full'
            ).execute()

            if grace_period_ms:
                internal_date = int(m.get('internalDate', '0'))
                age_ms = datetime.now(timezone.utc).timestamp() * 1000 - internal_date
                if age_ms < grace_period_ms:
                    skipped_grace += 1
                    continue

            headers = {h['name']: h['value'] for h in m['payload']['headers']}
            sender = headers.get('From', '')
            subject = headers.get('Subject', '')
            snippet = m.get('snippet', '')
            thread_id = m.get('threadId')
            body = _extract_body(m['payload'])

            if calendar_only:
                classification = extract_calendar_events_with_claude(client, sender, subject, snippet, body)
            else:
                classification = classify_with_claude(
                    client, sender, subject, snippet, body, list(label_name_to_id.keys()), mailbox_context
                )
        except Exception as e:
            log(f'  Skipped (classification error) {sender[:50] or msg["id"]}: {e}')
            continue

        category = None
        add_labels = []
        remove_labels = []

        if not calendar_only:
            if any(d in sender.lower() for d in NO_REPLY_DOMAINS):
                classification['category'] = 'notification'
                classification['archive'] = True
                classification['draft_reply'] = None

            category = classification.get('category')

            # Handle needs_response drafting first — the archive decision below
            # depends on whether a draft actually exists (not just whether we
            # intended to make one), so a failed draft never leaves a thread
            # silently archived with nothing to act on.
            has_draft = False
            if category == 'needs_response' and classification.get('draft_reply'):
                if thread_id in drafted_threads:
                    has_draft = True
                elif _thread_has_reply_or_draft(service, thread_id, thread_reply_cache):
                    has_draft = True  # already handled in a previous run
                else:
                    to_email = re.search(r'<(.+?)>', sender).group(1) if '<' in sender else sender
                    try:
                        draft_id = create_threaded_draft(
                            to_email=to_email,
                            subject=subject if subject.startswith('Re:') else f'Re: {subject}',
                            body=classification['draft_reply'],
                            thread_id=thread_id,
                            service=service,
                        )
                        log(f'    -> Draft created: {draft_id}')
                        drafted += 1
                        drafted_threads.add(thread_id)
                        has_draft = True
                    except Exception as e:
                        log(f'  Draft failed: {e}')

            # A needs_response thread with a draft waiting in Drafts has been
            # handled — archive it too so it doesn't linger in the inbox.
            if classification.get('archive') or has_draft:
                remove_labels = ['INBOX']
                archived += 1

        existing_label = classification.get('existing_label') if not calendar_only else None
        new_label_suggestion = classification.get('new_label_suggestion') if not calendar_only else None

        if existing_label and existing_label.lower() in label_name_to_id_lower:
            add_labels.append(label_name_to_id_lower[existing_label.lower()])
            labeled += 1
        elif new_label_suggestion:
            if new_label_suggestion.lower() not in label_name_to_id_lower:
                try:
                    new_label = service.users().labels().create(
                        userId='me', body={'name': new_label_suggestion}
                    ).execute()
                    label_name_to_id[new_label['name']] = new_label['id']
                    label_name_to_id_lower[new_label['name'].lower()] = new_label['id']
                    labels_created += 1
                    log(f'  Created label: {new_label_suggestion}')
                except Exception as e:
                    log(f'  Label creation failed for "{new_label_suggestion}": {e}')
            if new_label_suggestion.lower() in label_name_to_id_lower:
                add_labels.append(label_name_to_id_lower[new_label_suggestion.lower()])
                labeled += 1

        if add_labels or remove_labels:
            body_req = {}
            if add_labels:
                body_req['addLabelIds'] = add_labels
            if remove_labels:
                body_req['removeLabelIds'] = remove_labels
            service.users().messages().modify(userId='me', id=msg['id'], body=body_req).execute()

        if calendar_service and calendar_id:
            for event in classification.get('calendar_events') or []:
                try:
                    if event.get('title') and event.get('date'):
                        created_id = create_event_if_new(
                            calendar_service, calendar_id, event, source_msg_id=msg['id']
                        )
                        if created_id:
                            events_created += 1
                            log(f'    -> Calendar event created: {event["title"]} ({event["date"]})')
                except Exception as e:
                    log(f'  Calendar event failed for "{event.get("title")}": {e}')

        n_events = len(classification.get('calendar_events') or [])
        if calendar_only:
            log(f'  {"(event found)" if n_events else "(no events)"}: {sender[:50]} | {subject[:50]}')
        else:
            log(f'  {category}: {sender[:50]} | {subject[:50]}')

    log(
        (f'Done — calendar events created: {events_created}, skipped (grace period): {skipped_grace}'
         if calendar_only else
         f'Done — archived: {archived}, labeled: {labeled}, drafts created: {drafted}, '
         f'labels created: {labels_created}, calendar events created: {events_created}, '
         f'skipped (grace period): {skipped_grace}')
    )
    return {
        'archived': archived, 'labeled': labeled, 'drafted': drafted,
        'labels_created': labels_created, 'events_created': events_created,
        'skipped_grace': skipped_grace,
    }
