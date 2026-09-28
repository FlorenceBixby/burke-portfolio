"""
Bill Forwarder — burke.ruder@gmail.com → work email, once a month.

Cloudflare reimburses Burke's internet and phone bills. This finds the latest
bill email from each carrier in his personal Gmail and sends it to his work
address so he can expense it. Built 2026-09-28.

How it decides what to send, per carrier (most recent matching email wins):
  1. PDF attached          → send a short cover email with the PDF attached.
  2. No PDF (Spectrum)     → re-send the carrier's original email untouched,
                             subject prefixed with carrier/month/amount.
A carrier that has already been sent for the current billing month is skipped
(state lives in output/bill_forwarder_state.json, committed by the workflow).

Usage:
  python bill_forwarder.py --dry-run      # list what would be sent, send nothing
  python bill_forwarder.py                # send to WORK_EMAIL

Env: WORK_EMAIL (required unless --dry-run), BILL_CARRIERS (optional, comma-
separated sender-domain overrides), LOOKBACK_DAYS (default 40).
"""

import base64
import json
import os
import re
import sys
from datetime import datetime, timezone
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from dotenv import load_dotenv

from gmail_agent import _get_gmail_service, _extract_body

load_dotenv()

CREDENTIALS_FILE = Path(__file__).parent / "gmail_credentials_personal.json"
# Both household inboxes. Spectrum bills land in atxruders@ (found 2026-09-28);
# a token file that's missing is skipped so a local run with one token works.
ACCOUNTS = [
    ("burke.ruder@gmail.com", Path(__file__).parent / "gmail_token_personal.json"),
    ("atxruders@gmail.com",   Path(__file__).parent / "gmail_token_atxruders.json"),
]
STATE_FILE = Path(__file__).parent / "output" / "bill_forwarder_state.json"

# Carriers we look for. key → (label, sender-domain fragments, extra subject words).
# The scan is deliberately broad; --dry-run shows which ones actually hit so
# the list can be trimmed to Burke's real providers.
CARRIERS = {
    "att":          ("AT&T",          ["att.com", "att-mail.com", "e.att.com"],            []),
    "spectrum":     ("Spectrum",      ["spectrumemails.com", "spectrum.com", "spectrum.net", "charter.com"],     []),
    "google_fiber": ("Google Fiber",  ["fiber.google.com", "google.com"],                  ["fiber"]),
    "verizon":      ("Verizon",       ["verizon.com", "verizonwireless.com", "vzw.com"],   []),
    "tmobile":      ("T-Mobile",      ["t-mobile.com", "tmobile.com"],                     []),
    "xfinity":      ("Xfinity",       ["xfinity.com", "comcast.com", "comcast.net"],       []),
    "astound":      ("Astound/Grande",["astound.com", "grande.com", "rcn.com"],            []),
    "frontier":     ("Frontier",      ["frontier.com"],                                    []),
    "mint":         ("Mint Mobile",   ["mintmobile.com"],                                  []),
    "visible":      ("Visible",       ["visible.com"],                                     []),
    "us_cellular":  ("US Cellular",   ["uscellular.com"],                                  []),
    "cricket":      ("Cricket",       ["cricketwireless.com"],                             []),
    "starlink":     ("Starlink",      ["starlink.com"],                                    []),
    "tachus":       ("Tachus",        ["tachus.com"],                                      []),
}
BILL_WORDS = '(bill OR statement OR invoice OR "amount due" OR autopay OR "payment scheduled" OR "is ready")'

AMOUNT_RE = re.compile(r"\$\s?(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)")
DUE_RE = re.compile(r"(?:due|auto[- ]?pay(?:ment)?(?: date| scheduled)?|will be (?:paid|charged|drafted))[^$\n]{0,40}?(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.? \d{1,2}(?:, \d{4})?|\d{1,2}/\d{1,2}(?:/\d{2,4})?)", re.I)
LINK_RE = re.compile(r"https?://[^\s\">)]+")


def log(msg):
    print(f"[{datetime.now(timezone.utc).strftime('%H:%M:%S')}] {msg}", flush=True)


def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"sent": {}}


def save_state(state):
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2))


def carrier_query(domains, extra_words, lookback):
    froms = " OR ".join(f"from:{d}" for d in domains)
    extra = (" " + " ".join(extra_words)) if extra_words else ""
    return f"({froms}) {BILL_WORDS}{extra} newer_than:{lookback}d -in:trash -in:spam"


def find_candidates(service, lookback):
    """Return {carrier_key: newest matching message metadata}."""
    found = {}
    for key, (label, domains, extra) in CARRIERS.items():
        q = carrier_query(domains, extra, lookback)
        res = service.users().messages().list(userId="me", q=q, maxResults=10).execute()
        ids = [m["id"] for m in res.get("messages", [])]
        if not ids:
            continue
        best = None
        for mid in ids:
            msg = service.users().messages().get(userId="me", id=mid, format="full").execute()
            hdr = {h["name"].lower(): h["value"] for h in msg["payload"].get("headers", [])}
            pdfs = list(_walk_pdfs(msg["payload"]))
            subj = hdr.get("subject", "")
            # Skip marketing that merely mentions "bill"; a real bill email is
            # from the carrier's billing sender or has the PDF.
            body = _extract_body(msg["payload"]) or _html_text(msg["payload"])
            cand = {
                "id": mid, "carrier": key, "label": label, "from": hdr.get("from", ""),
                "subject": subj, "date": hdr.get("date", ""), "internal": int(msg.get("internalDate", 0)),
                "pdfs": pdfs, "amount": _first(AMOUNT_RE, body), "due": _first(DUE_RE, body),
                "link": _portal_link(body, domains),
            }
            cand["rank"] = (bool(cand["pdfs"]), bool(re.search(r"statement|bill is ready|invoice", subj, re.I)), cand["internal"])
            if best is None or cand["rank"] > best["rank"]:
                best = cand
        found[key] = best
    return found


def _first(rx, text):
    m = rx.search(text or "")
    return m.group(1) if m else None


def _portal_link(body, domains):
    for url in LINK_RE.findall(body or ""):
        if any(d.split(".")[0] in url for d in domains) and re.search(r"bill|statement|pay|account|myatt|login", url, re.I):
            return url
    return None


def _html_text(payload):
    """Fallback when there's no text/plain part: strip tags from text/html."""
    if payload.get("mimeType") == "text/html":
        data = payload.get("body", {}).get("data", "")
        if data:
            html = base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")
            return re.sub(r"<[^>]+>", " ", html)
    for part in payload.get("parts", []):
        t = _html_text(part)
        if t:
            return t
    return ""


def _walk_pdfs(payload):
    fn = payload.get("filename") or ""
    if fn.lower().endswith(".pdf") and payload.get("body", {}).get("attachmentId"):
        yield {"filename": fn, "attachmentId": payload["body"]["attachmentId"]}
    for part in payload.get("parts", []):
        yield from _walk_pdfs(part)


def billing_month(cand):
    return datetime.fromtimestamp(cand["internal"] / 1000, tz=timezone.utc).strftime("%Y-%m")


def forward_raw(service, cand, to_addr, from_addr):
    """Re-send the carrier's original email to the work address, content untouched.
    Reviewers get the carrier-branded statement, not a paraphrase."""
    import email
    from email import policy
    raw = service.users().messages().get(userId="me", id=cand["id"], format="raw").execute()["raw"]
    msg = email.message_from_bytes(base64.urlsafe_b64decode(raw), policy=policy.default)
    for h in ("To", "Cc", "Bcc", "From", "Reply-To", "Message-ID", "DKIM-Signature", "Return-Path", "Received", "List-Unsubscribe", "List-Unsubscribe-Post"):
        del msg[h]
    msg["From"] = from_addr
    msg["To"] = to_addr
    orig_subject = cand["subject"]
    del msg["Subject"]
    msg["Subject"] = f"Fwd: {cand['label']} bill {billing_month(cand)}" + (f" ${cand['amount']}" if cand["amount"] else "") + f" — {orig_subject}"
    return {"raw": base64.urlsafe_b64encode(msg.as_bytes()).decode()}


def build_email(service, cand, to_addr):
    msg = MIMEMultipart()
    msg["To"] = to_addr
    msg["Subject"] = f"{cand['label']} bill — {billing_month(cand)}" + (f" — ${cand['amount']}" if cand["amount"] else "")
    lines = [
        f"{cand['label']} bill for expense reimbursement.",
        f"Amount: ${cand['amount']}" if cand["amount"] else "Amount: not found in the email text",
        f"Due / autopay: {cand['due']}" if cand["due"] else "",
        f"Original email: {cand['subject']} ({cand['date']})",
    ]
    if cand["pdfs"]:
        lines.append(f"PDF attached: {', '.join(p['filename'] for p in cand['pdfs'])}")
    else:
        lines.append("No PDF was attached to the carrier's email. Download it from the portal and attach it to the expense:")
        lines.append(cand["link"] or "(no portal link found in the email)")
    lines.append("")
    lines.append("Sent automatically by the bill forwarder in burke-portfolio/personal-agents.")
    msg.attach(MIMEText("\n".join(l for l in lines if l is not None), "plain"))
    for p in cand["pdfs"]:
        att = service.users().messages().attachments().get(userId="me", messageId=cand["id"], id=p["attachmentId"]).execute()
        data = base64.urlsafe_b64decode(att["data"])
        part = MIMEApplication(data, _subtype="pdf")
        part.add_header("Content-Disposition", "attachment", filename=p["filename"])
        msg.attach(part)
    return {"raw": base64.urlsafe_b64encode(msg.as_bytes()).decode()}


def discover(service, lookback):
    """--discover: list every sender domain with a bill-looking email, so the
    CARRIERS table can be matched to Burke's real providers."""
    from collections import Counter
    q = f"{BILL_WORDS} newer_than:{lookback}d -in:trash -in:spam"
    res = service.users().messages().list(userId="me", q=q, maxResults=150).execute()
    counts, example = Counter(), {}
    for m in res.get("messages", []):
        meta = service.users().messages().get(userId="me", id=m["id"], format="metadata", metadataHeaders=["From", "Subject"]).execute()
        h = {x["name"].lower(): x["value"] for x in meta["payload"].get("headers", [])}
        dom = h.get("from", "").split("@")[-1].strip(">")
        counts[dom] += 1
        example.setdefault(dom, h.get("subject", "")[:80])
    log(f"discover: {sum(counts.values())} bill-looking emails in {lookback}d")
    for dom, n in counts.most_common(40):
        log(f"  {n:3} {dom:38} {example[dom]}")


def main():
    dry = "--dry-run" in sys.argv
    if "--discover" in sys.argv:
        for addr, token in ACCOUNTS:
            if token.exists():
                log(f"== {addr}")
                discover(_get_gmail_service(credentials_path=CREDENTIALS_FILE, token_path=token), int(os.environ.get("LOOKBACK_DAYS", "60")))
        return
    lookback = int(os.environ.get("LOOKBACK_DAYS", "40"))
    to_addr = os.environ.get("WORK_EMAIL", "").strip()
    if not dry and not to_addr:
        log("WORK_EMAIL secret is not set; scanning only, nothing will be sent.")
        dry = True

    state = load_state()
    sent_any = False
    any_found = False
    for addr, token in ACCOUNTS:
        if not token.exists():
            log(f"{addr}: no token file, skipping")
            continue
        service = _get_gmail_service(credentials_path=CREDENTIALS_FILE, token_path=token)
        found = find_candidates(service, lookback)
        log(f"{addr}: {len(found)} carrier(s) matched")
        for key, cand in found.items():
            any_found = True
            month = billing_month(cand)
            status = "PDF" if cand["pdfs"] else "no PDF"
            log(f"  {cand['label']:<14} {month}  {status:<7} amount={cand['amount']} due={cand['due']}  subj={cand['subject'][:70]}")
            if state["sent"].get(key) == month:
                log(f"    already sent for {month}, skipping")
                continue
            if dry:
                log(f"    would forward → {to_addr or '(WORK_EMAIL unset)'}")
                continue
            body = build_email(service, cand, to_addr) if cand["pdfs"] else forward_raw(service, cand, to_addr, addr)
            service.users().messages().send(userId="me", body=body).execute()
            state["sent"][key] = month
            sent_any = True
            log(f"    sent → {to_addr}")
    if not any_found:
        log("No carrier bill emails found in the lookback window.")
    if sent_any:
        save_state(state)


if __name__ == "__main__":
    main()
