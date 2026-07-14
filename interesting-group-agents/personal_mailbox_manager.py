"""
Personal Mailbox Manager — burke.ruder@gmail.com
Runs daily. Archives/labels marketing, bills, and notifications; drafts
replies (never sends) only for threads that genuinely need a response.

Unlike mailbox_manager.py (static rules for the fixed set of known TIG
contacts), this uses Claude to classify each thread and draft replies,
since personal-inbox senders are unpredictable.

Setup (one-time):
  See gmail_agent.py's docstring for the general OAuth flow. To connect
  burke.ruder@gmail.com specifically (a second account, separate from the
  default TIG credentials), run from this directory:

    python3 gmail_agent.py --setup \
      --credentials gmail_credentials_personal.json \
      --token gmail_token_personal.json

  Log in as burke.ruder@gmail.com when the browser opens.
"""

import os
import re
import json
from datetime import datetime
from pathlib import Path

from anthropic import Anthropic
from dotenv import load_dotenv

from gmail_agent import _get_gmail_service, create_threaded_draft, _extract_body

load_dotenv()

CREDENTIALS_FILE = Path(__file__).parent / "gmail_credentials_personal.json"
TOKEN_FILE = Path(__file__).parent / "gmail_token_personal.json"

CLAUDE_MODEL = "claude-sonnet-4-6"

# Gmail system labels that aren't real user "folders" — never offered to
# Claude as an existing-label option, never created, never removed except
# INBOX (archiving).
SYSTEM_LABELS = {
    "INBOX", "SENT", "DRAFT", "TRASH", "SPAM", "STARRED", "UNREAD",
    "IMPORTANT", "CHAT",
}

CLASSIFY_SYSTEM_PROMPT = """You triage one email at a time from Burke's personal Gmail inbox (burke.ruder@gmail.com).

For each email, decide:
1. category — one of: needs_response, marketing, bill, notification, newsletter, spam
   - needs_response: a real person (or a business matter) is waiting on Burke to reply, decide, or act.
   - marketing: promotional content, sales pitches, product announcements.
   - bill: statements, invoices, payment confirmations, receipts — informational, no reply needed.
   - notification: automated alerts, shipping updates, account/security notices, calendar invites already handled, etc.
   - newsletter: subscribed digests/content updates.
   - spam: unsolicited junk, phishing-looking, or clearly unwanted.
2. archive — true unless category is needs_response (needs_response should stay visible in the inbox).
3. existing_label — the name of one label from the "Existing labels" list below if it clearly fits, else null.
4. new_label_suggestion — only if nothing existing fits AND this email is worth being able to find again later (e.g. a real bill, a warranty, a receipt worth keeping) — a short, well-organized folder name (e.g. "Bills", "Receipts", "Travel"). Prefer reusing a close existing label over creating a near-duplicate. Null for anything disposable like typical marketing/spam.
5. draft_reply — only when category is needs_response: a short, natural reply in Burke's voice, first person, casual-professional tone, signed just "Burke" (no company block — this is his personal email). Leave a bracketed placeholder like [confirm date] for any detail you can't know. Null otherwise.

Respond with ONLY a JSON object, no other text:
{"category": "...", "archive": true/false, "existing_label": "..." or null, "new_label_suggestion": "..." or null, "draft_reply": "..." or null}
"""


def log(msg):
    ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    line = f'[{ts}] {msg}'
    print(line)
    os.makedirs('output', exist_ok=True)
    with open('output/personal_mailbox.log', 'a') as f:
        f.write(line + '\n')


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


def classify_with_claude(client: Anthropic, sender: str, subject: str, snippet: str, body: str, label_names: list) -> dict:
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
        max_tokens=1024,
        system=CLASSIFY_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_content}],
    )
    text = response.content[0].text
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON found in Claude response: {text[:200]}")
    return json.loads(match.group(0))


def run_personal_mailbox_manager():
    log('=== PERSONAL MAILBOX MANAGER ===')

    anthropic_key = os.environ['ANTHROPIC_API_KEY']
    client = Anthropic(api_key=anthropic_key)

    service = _get_gmail_service(credentials_path=CREDENTIALS_FILE, token_path=TOKEN_FILE)

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
    thread_reply_cache = {}
    drafted_threads = set()

    for msg in messages:
        sender = ''
        try:
            m = service.users().messages().get(
                userId='me', id=msg['id'], format='full'
            ).execute()
            headers = {h['name']: h['value'] for h in m['payload']['headers']}
            sender = headers.get('From', '')
            subject = headers.get('Subject', '')
            snippet = m.get('snippet', '')
            thread_id = m.get('threadId')
            body = _extract_body(m['payload'])

            classification = classify_with_claude(
                client, sender, subject, snippet, body, list(label_name_to_id.keys())
            )
        except Exception as e:
            log(f'  Skipped (classification error) {sender[:50] or msg["id"]}: {e}')
            continue

        category = classification.get('category')
        add_labels = []
        remove_labels = []

        if classification.get('archive'):
            remove_labels = ['INBOX']
            archived += 1

        existing_label = classification.get('existing_label')
        new_label_suggestion = classification.get('new_label_suggestion')

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

        log(f'  {category}: {sender[:50]} | {subject[:50]}')

        if category == 'needs_response' and classification.get('draft_reply') and thread_id not in drafted_threads:
            if not _thread_has_reply_or_draft(service, thread_id, thread_reply_cache):
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
                except Exception as e:
                    log(f'  Draft failed: {e}')

    log(f'Done — archived: {archived}, labeled: {labeled}, drafts created: {drafted}, labels created: {labels_created}')
    return {'archived': archived, 'labeled': labeled, 'drafted': drafted, 'labels_created': labels_created}


if __name__ == '__main__':
    run_personal_mailbox_manager()
