"""
Stop Gmail filters from moving mail out of the inbox, without losing labels.

Gmail filters can't be edited in place, so each filter that removes INBOX
(i.e. "skip the inbox") is re-created with the same criteria and label but
without the skip, then the old one is deleted. Filters that only add a label
are left alone. A filter that sends mail to TRASH is left alone too (that's a
deliberate "delete this sender", not filing).

Every original filter is backed up to output/filters_backup_<account>.json
before anything changes, so this is reversible.

Usage:  ACCOUNT=personal DRY_RUN=1 python3 fix_filters.py
Needs a token with gmail.settings.basic (gmail_agent.py --setup --settings).
"""

import json
import os
from pathlib import Path

from gmail_agent import _get_credentials, SCOPES, SETTINGS_SCOPE
from googleapiclient.discovery import build

HERE = Path(__file__).parent
ACCOUNT = os.environ.get("ACCOUNT", "personal")
TOKEN_FILE = HERE / f"gmail_token_{ACCOUNT}.json"
DRY_RUN = os.environ.get("DRY_RUN") == "1"


def main():
    creds = _get_credentials(HERE / "gmail_credentials_personal.json", TOKEN_FILE, scopes=[*SCOPES, SETTINGS_SCOPE])
    svc = build("gmail", "v1", credentials=creds)
    filters = svc.users().settings().filters().list(userId="me").execute().get("filter", [])
    labels = {l["id"]: l["name"] for l in svc.users().labels().list(userId="me").execute().get("labels", [])}

    out = HERE / "output"
    out.mkdir(exist_ok=True)
    backup = out / f"filters_backup_{ACCOUNT}.json"
    if not backup.exists():  # keep the ORIGINAL set if this is re-run
        backup.write_text(json.dumps(filters, indent=1))

    skippers = [f for f in filters if "INBOX" in f.get("action", {}).get("removeLabelIds", [])
                and "TRASH" not in f.get("action", {}).get("addLabelIds", [])]
    print(f"[{ACCOUNT}] {len(filters)} filters; {len(skippers)} skip the inbox and will be rewritten")

    done = 0
    for f in skippers:
        action = dict(f["action"])
        action["removeLabelIds"] = [x for x in action.get("removeLabelIds", []) if x != "INBOX"]
        if not action["removeLabelIds"]:
            action.pop("removeLabelIds")
        tag = ", ".join(labels.get(x, x) for x in action.get("addLabelIds", [])) or "(no label)"
        print(f"  {f['criteria']} -> keep '{tag}', stop skipping inbox")
        if DRY_RUN:
            continue
        if action.get("addLabelIds") or action.get("removeLabelIds") or action.get("forward"):
            try:
                svc.users().settings().filters().create(userId="me", body={"criteria": f["criteria"], "action": action}).execute()
            except Exception as e:
                if "already exists" not in str(e):  # a same-label, non-skipping twin already exists: just drop the skipper
                    raise
        svc.users().settings().filters().delete(userId="me", id=f["id"]).execute()
        done += 1
    print("dry run, nothing changed" if DRY_RUN else f"rewrote {done} filters; backup in output/filters_backup_{ACCOUNT}.json")


if __name__ == "__main__":
    main()
