"""
One-off: put every unread message that the mailbox manager archived back in
atxruders@gmail.com's inbox. Labels it applied are left in place as tags —
Gmail labels aren't exclusive, so an email can be in the inbox and labeled.

DRY_RUN=1 lists what would change without touching anything.
"""

import os
from pathlib import Path

from gmail_agent import _get_gmail_service

CREDENTIALS_FILE = Path(__file__).parent / "gmail_credentials_personal.json"
TOKEN_FILE = Path(__file__).parent / "gmail_token_atxruders.json"
QUERY = "is:unread -in:inbox -in:spam -in:trash -in:sent -in:draft"
DRY_RUN = os.environ.get("DRY_RUN") == "1"


def main():
    service = _get_gmail_service(credentials_path=CREDENTIALS_FILE, token_path=TOKEN_FILE)
    ids = []
    page_token = None
    while True:
        resp = service.users().messages().list(userId="me", q=QUERY, maxResults=500, pageToken=page_token).execute()
        ids.extend(m["id"] for m in resp.get("messages", []))
        page_token = resp.get("nextPageToken")
        if not page_token:
            break
    print(f"{len(ids)} unread messages outside the inbox")

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
