"""
Put every unread message that's sitting outside the inbox (archived or in a
folder/label) back in the inbox. ACCOUNT=personal (burke.ruder@) or atxruders. Labels it applied are left in place as tags —
Gmail labels aren't exclusive, so an email can be in the inbox and labeled.

DRY_RUN=1 lists what would change without touching anything.
"""

import os
from pathlib import Path

from gmail_agent import _get_gmail_service

CREDENTIALS_FILE = Path(__file__).parent / "gmail_credentials_personal.json"
ACCOUNT = os.environ.get("ACCOUNT", "atxruders")
TOKEN_FILE = Path(__file__).parent / f"gmail_token_{ACCOUNT}.json"
QUERY = "is:unread -in:inbox -in:spam -in:trash -in:sent -in:draft"
DRY_RUN = os.environ.get("DRY_RUN") == "1"


def report_filters(service):
    """Read-only: list Gmail filters that skip the inbox or apply labels, so we
    can see what keeps routing mail out of the inbox."""
    try:
        labels = {l["id"]: l["name"] for l in service.users().labels().list(userId="me").execute().get("labels", [])}
        filters = service.users().settings().filters().list(userId="me").execute().get("filter", [])
    except Exception as e:
        print(f"[{ACCOUNT}] couldn't read filters: {e}")
        return
    movers = [f for f in filters if "INBOX" in f.get("action", {}).get("removeLabelIds", []) or f.get("action", {}).get("addLabelIds")]
    print(f"[{ACCOUNT}] {len(filters)} Gmail filters, {len(movers)} skip the inbox or add a label:")
    for f in movers:
        a = f.get("action", {})
        print(f"  FILTER {f['id']}: {f.get('criteria')} -> add {[labels.get(x, x) for x in a.get('addLabelIds', [])]} remove {[labels.get(x, x) for x in a.get('removeLabelIds', [])]}")
    # Where the unread-outside-inbox mail is sitting, by label
    from collections import Counter
    return labels


def main():
    service = _get_gmail_service(credentials_path=CREDENTIALS_FILE, token_path=TOKEN_FILE)
    report_filters(service)
    ids = []
    page_token = None
    while True:
        resp = service.users().messages().list(userId="me", q=QUERY, maxResults=500, pageToken=page_token).execute()
        ids.extend(m["id"] for m in resp.get("messages", []))
        page_token = resp.get("nextPageToken")
        if not page_token:
            break
    print(f"[{ACCOUNT}] {len(ids)} unread messages outside the inbox")

    for mid in ids[:15]:
        msg = service.users().messages().get(userId="me", id=mid, format="metadata", metadataHeaders=["From", "Subject"]).execute()
        headers = {h["name"]: h["value"] for h in msg["payload"].get("headers", [])}
        print(f"  {headers.get('From', '?')[:40]:40} | {headers.get('Subject', '?')[:60]}")
    if len(ids) > 15:
        print(f"  ... and {len(ids) - 15} more")

    if DRY_RUN or not ids:
        print("dry run — nothing changed" if DRY_RUN else "nothing to do")
        return

    for i in range(0, len(ids), 500):
        service.users().messages().batchModify(userId="me", body={"ids": ids[i:i + 500], "addLabelIds": ["INBOX"]}).execute()
    print(f"moved {len(ids)} messages back to the inbox")


if __name__ == "__main__":
    main()
