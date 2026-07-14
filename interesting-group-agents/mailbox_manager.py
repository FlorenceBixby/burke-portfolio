"""
Mailbox Manager — burke@theinterestinggroup.com
Runs daily. Cleans, labels, and drafts responses for emails that need them.
"""

import os
import re
from datetime import datetime
from gmail_agent import _get_gmail_service, create_threaded_draft, _extract_body
from dotenv import load_dotenv

load_dotenv()

LABEL_IDS = {
    'pipeline':    'Label_11',
    'vendors':     'Label_12',
    'admin':       'Label_13',
    'newsletters': 'Label_14',
}

# Senders to auto-archive (move out of inbox, keep in All Mail)
ARCHIVE_SENDERS = [
    'alignable.com', 'theneurondai', 'chilipiper.com',
    'mail.apollo.io', 'apollomail.io', 'ca@apollo.io',
    'support@apollo.io', 'noreply@email.alignable.com',
]
ARCHIVE_SUBJECTS = [
    'your receipt', 'monthly statement', 'synchrony home',
    'warm up', 'removal request', 'unsubscribe', 'account is about to expire',
    'our call today', 'want me to walk you through',
]
SPAM_SENDERS = ['rileywilliamsrw4@gmail.com']

NEWSLETTER_SENDERS = ['theneuron@', 'newsletter.', 'substack.com', 'beehiiv.com']
ADMIN_SENDERS      = ['invoice+', 'statements@', 'noreply@', 'postmaster@', 'mailer-daemon']
VENDOR_SENDERS     = ['sandlerpartners.com', 'tpx.com', 'island.io', 'amplemarket.com']
PIPELINE_SENDERS   = ['hrstrategiestx.com', 'cloudflare.com']

# Senders that likely need a response (not auto-archived, not newsletters)
NEEDS_RESPONSE_DOMAINS = [
    'hrstrategiestx.com', 'cloudflare.com', 'island.io',
    'sandlerpartners.com', 'tpx.com',
]

def log(msg):
    ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    line = f'[{ts}] {msg}'
    print(line)
    os.makedirs('output', exist_ok=True)
    with open('output/mailbox.log', 'a') as f:
        f.write(line + '\n')


def classify(sender: str, subject: str) -> str:
    s = sender.lower()
    sub = subject.lower()
    if any(x in s for x in SPAM_SENDERS):
        return 'spam'
    if any(x in s for x in ARCHIVE_SENDERS) or any(x in sub for x in ARCHIVE_SUBJECTS):
        return 'archive'
    if any(x in s for x in NEWSLETTER_SENDERS):
        return 'newsletter'
    if any(x in s for x in ADMIN_SENDERS):
        return 'admin'
    if any(x in s for x in PIPELINE_SENDERS):
        return 'pipeline'
    if any(x in s for x in VENDOR_SENDERS):
        return 'vendor'
    return 'unknown'


def needs_response(sender: str, labels: list) -> bool:
    """True if the email is from a real person and we haven't responded."""
    s = sender.lower()
    return any(d in s for d in NEEDS_RESPONSE_DOMAINS) and 'SENT' not in labels


def draft_response(sender: str, subject: str, body: str, thread_id: str, service) -> str:
    """Use Claude-style template to draft a reply."""
    name = sender.split('<')[0].strip().split()[0] if '<' in sender else sender.split('@')[0]

    # Determine response type
    s = sender.lower()
    body_lower = body.lower()

    if 'island.io' in s:
        reply = f"""Hi {name},

Thanks for reaching out. Apologies for the delay — things have been moving quickly as we've been building out The Interesting Group.

I'd love to reconnect. We're actively working with businesses across Texas and beyond, and I think there's a real opportunity here. Are you available for a quick call this week or next?

Burke
The Interesting Group
burke@theinterestinggroup.com"""

    elif 'hrstrategies' in s:
        reply = f"""Hi {name},

Thanks for getting back to me — really glad the options were helpful. If anything else comes up on the tech side or a new need arises, don't hesitate to reach out.

Happy to help whenever you need it.

Burke
The Interesting Group
burke@theinterestinggroup.com"""

    elif 'sandlerpartners' in s or 'tpx.com' in s:
        reply = f"""Hey {name},

Apologies for the slow reply — been heads down getting things moving on our end.

Still very interested in connecting on this. What does your calendar look like this week for a quick call?

Burke"""

    elif 'cloudflare' in s:
        reply = f"""Hi {name},

Thanks for the note. Happy to follow up on this — let me know the best way to connect.

Burke"""

    else:
        reply = f"""Hi {name},

Thank you for your email. I'll follow up shortly.

Burke Ruder
The Interesting Group
burke@theinterestinggroup.com"""

    try:
        draft_id = create_threaded_draft(
            to_email=re.search(r'<(.+?)>', sender).group(1) if '<' in sender else sender,
            subject=subject if subject.startswith('Re:') else f'Re: {subject}',
            body=reply,
            thread_id=thread_id
        )
        return draft_id
    except Exception as e:
        log(f'  Draft failed: {e}')
        return None


def run_mailbox_manager():
    log('=== MAILBOX MANAGER ===')
    service = _get_gmail_service()

    # Fetch up to 100 inbox messages
    result = service.users().messages().list(
        userId='me', labelIds=['INBOX'], maxResults=100
    ).execute()
    messages = result.get('messages', [])
    log(f'Inbox messages: {len(messages)}')

    archived = 0
    labeled = 0
    drafted = 0
    already_processed = set()
    drafted_threads = set()   # one draft per thread max

    for msg in messages:
        if msg['id'] in already_processed:
            continue
        already_processed.add(msg['id'])

        m = service.users().messages().get(
            userId='me', id=msg['id'], format='full'
        ).execute()
        headers  = {h['name']: h['value'] for h in m['payload']['headers']}
        sender   = headers.get('From', '')
        subject  = headers.get('Subject', '')
        msg_labels = m.get('labelIds', [])
        thread_id = m.get('threadId')

        category = classify(sender, subject)

        add_labels    = []
        remove_labels = []

        if category == 'spam':
            remove_labels = ['INBOX']
            add_labels    = ['TRASH']
            log(f'  Trashed: {sender[:50]}')
            archived += 1

        elif category == 'archive':
            remove_labels = ['INBOX']
            log(f'  Archived: {subject[:60]}')
            archived += 1

        elif category == 'newsletter':
            remove_labels = ['INBOX']
            add_labels    = [LABEL_IDS['newsletters']]
            archived += 1

        elif category == 'admin':
            remove_labels = ['INBOX']
            add_labels    = [LABEL_IDS['admin']]
            archived += 1

        elif category == 'pipeline':
            add_labels = [LABEL_IDS['pipeline']]
            labeled   += 1
            log(f'  Pipeline: {sender[:50]} | {subject[:40]}')

            if needs_response(sender, msg_labels) and thread_id not in drafted_threads:
                body = _extract_body(m['payload'])
                draft_id = draft_response(sender, subject, body, thread_id, service)
                if draft_id:
                    log(f'    → Draft created: {draft_id}')
                    drafted += 1
                    drafted_threads.add(thread_id)

        elif category == 'vendor':
            add_labels = [LABEL_IDS['vendors']]
            labeled   += 1

            if needs_response(sender, msg_labels) and thread_id not in drafted_threads:
                body = _extract_body(m['payload'])
                draft_id = draft_response(sender, subject, body, thread_id, service)
                if draft_id:
                    log(f'    → Draft created for vendor: {sender[:40]}')
                    drafted += 1
                    drafted_threads.add(thread_id)

        if add_labels or remove_labels:
            body = {}
            if add_labels:    body['addLabelIds']    = add_labels
            if remove_labels: body['removeLabelIds'] = remove_labels
            service.users().messages().modify(userId='me', id=msg['id'], body=body).execute()

    log(f'Done — archived: {archived}, labeled: {labeled}, drafts created: {drafted}')
    return {'archived': archived, 'labeled': labeled, 'drafted': drafted}


if __name__ == '__main__':
    run_mailbox_manager()
