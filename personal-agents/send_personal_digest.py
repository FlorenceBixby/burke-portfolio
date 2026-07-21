"""
Sends the daily research-digest email (see research_digest_state.json for
the dedup state it depends on). Invoked by the "morning-research-digest"
scheduled task, which writes the composed subject/HTML body to the files
below before calling this script.

Sends via Resend from a real subdomain (mail.theinterestinggroup.com)
rather than self-addressed Gmail — Gmail's inbox list overrides the
sender display name for mail you send to your own address, so a genuine
third-party send is the only way to reliably show "The Interesting
Group" instead of your own account name.

Usage:
  python3 send_personal_digest.py --subject-file output/digest_subject.txt --body-file output/digest_body.html
"""

import argparse
import os
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.environ["RESEND_API_KEY"]
FROM_ADDRESS = os.environ["NEWSLETTER_FROM_ADDRESS"]
TO_EMAIL = "burke.ruder@gmail.com"

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--subject-file", required=True)
    parser.add_argument("--body-file", required=True)
    parser.add_argument("--to", default=TO_EMAIL)
    args = parser.parse_args()

    subject = Path(args.subject_file).read_text().strip()
    body = Path(args.body_file).read_text()

    resp = requests.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
        json={"from": FROM_ADDRESS, "to": [args.to], "subject": subject, "html": body},
        timeout=20,
    )
    resp.raise_for_status()
    print(f"Sent: {resp.json()['id']}")
