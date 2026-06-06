"""
Reply Agent
Classifies inbound replies to cold outreach and drafts appropriate responses.
No AI API required — pattern matching covers 95% of cold email replies.

Intent buckets:
  INTERESTED      — wants to talk, asks for more info, open to a call
  QUESTION        — has a specific question before committing
  OBJECTION       — has a vendor, happy with current setup, not the right time
  NOT_ME          — wrong person, forwards to someone else
  OOO             — out of office auto-reply
  UNSUBSCRIBE     — stop emailing me
  UNKNOWN         — can't classify, flag for manual review
"""

# ── Intent classification ─────────────────────────────────────────────────────

INTERESTED_SIGNALS = [
    "sure", "yes", "sounds good", "interested", "let's talk", "let's connect",
    "schedule", "calendar", "availability", "free", "open to", "would love",
    "tell me more", "more info", "learn more", "how does", "what do you",
    "absolutely", "definitely", "happy to", "good timing", "actually",
    "reach out", "call me", "give me a call", "set something up",
    "when are you", "what time", "next week", "this week",
]

QUESTION_SIGNALS = [
    "what vendors", "which providers", "what companies", "who do you work with",
    "how does it work", "how do you get paid", "what's the process",
    "what services", "what products", "how long", "how much",
    "what's involved", "can you explain", "tell me about",
    "what does", "how would", "do you handle",
]

OBJECTION_SIGNALS = [
    "already have", "currently have", "happy with", "locked in", "under contract",
    "just signed", "recently switched", "not looking", "not interested",
    "don't need", "handle it internally", "have someone", "our it",
    "it department", "managed service", "msp", "no thanks", "not a fit",
    "too busy", "maybe later", "not right now", "bad timing", "reach out later",
    "try me in", "check back",
]

NOT_ME_SIGNALS = [
    "wrong person", "not the right", "you should contact", "reach out to",
    "talk to", "forward", "forwarding", "not my area", "not my department",
    "handles that", "handle that",
]

OOO_SIGNALS = [
    "out of office", "on vacation", "on leave", "away from", "will return",
    "be back", "limited access", "auto-reply", "automatic reply",
    "currently traveling", "returning on", "back on",
]

UNSUBSCRIBE_SIGNALS = [
    "unsubscribe", "remove me", "take me off", "stop emailing", "do not contact",
    "don't email", "opt out", "no more emails", "please don't",
]


def classify_reply(body: str, snippet: str = "") -> str:
    """Classify reply intent from body text. Returns intent string."""
    text = (body + " " + snippet).lower()

    # Check in priority order
    for signal in UNSUBSCRIBE_SIGNALS:
        if signal in text:
            return "UNSUBSCRIBE"

    for signal in OOO_SIGNALS:
        if signal in text:
            return "OOO"

    for signal in NOT_ME_SIGNALS:
        if signal in text:
            return "NOT_ME"

    # Score interested vs objection — highest count wins
    interested_score = sum(1 for s in INTERESTED_SIGNALS if s in text)
    objection_score = sum(1 for s in OBJECTION_SIGNALS if s in text)
    question_score = sum(1 for s in QUESTION_SIGNALS if s in text)

    if interested_score == 0 and objection_score == 0 and question_score == 0:
        return "UNKNOWN"

    if question_score > 0 and interested_score >= objection_score:
        return "QUESTION"

    if interested_score >= objection_score:
        return "INTERESTED"

    if objection_score > 0:
        return "OBJECTION"

    return "UNKNOWN"


# ── Response drafts ───────────────────────────────────────────────────────────

def draft_response(intent: str, prospect: dict, original_subject: str) -> dict:
    """
    Draft a reply based on classified intent.
    Returns {subject, body, intent, action}.
    """
    first = prospect.get("first_name", "there")
    company = prospect.get("company", "your company")

    if intent == "INTERESTED":
        subject = f"Re: {original_subject}"
        body = (
            f"Hi {first},\n\n"
            f"Great — appreciate you getting back to me.\n\n"
            f"I have availability this week and next. Here's a link to grab 15 minutes "
            f"at a time that works for you: https://calendly.com/burke-theinterestinggroup\n\n"
            f"Looking forward to it.\n\n"
            f"Burke\nThe Interesting Group | Buda, TX\n burke@theinterestinggroup.com"
        )
        action = "Send Calendly link — prospect is warm"

    elif intent == "QUESTION":
        subject = f"Re: {original_subject}"
        body = (
            f"Hi {first},\n\n"
            f"Happy to answer that — easier over a quick call than back and forth over email.\n\n"
            f"I work with about 30+ suppliers across connectivity, phone systems, and cloud. "
            f"My job is to figure out what's actually the best fit for {company} and negotiate it for you — "
            f"not push any one vendor. Takes about 15 minutes to understand your current setup "
            f"and I can usually tell you pretty quickly if there's anything worth looking at.\n\n"
            f"Here's my calendar if you want to grab a time: https://calendly.com/burke-theinterestinggroup\n\n"
            f"Burke\nThe Interesting Group | Buda, TX"
        )
        action = "Answered question, offered call — follow up in 2 days if no response"

    elif intent == "OBJECTION":
        subject = f"Re: {original_subject}"
        body = (
            f"Hi {first},\n\n"
            f"Totally fair — appreciate you letting me know.\n\n"
            f"If anything changes or contracts come up for renewal, feel free to reach out. "
            f"I'm not going anywhere.\n\n"
            f"Burke\nThe Interesting Group | Buda, TX"
        )
        action = "Soft close — keep in HubSpot, revisit in 6 months"

    elif intent == "NOT_ME":
        subject = f"Re: {original_subject}"
        body = (
            f"Hi {first},\n\n"
            f"Thanks for pointing me in the right direction — I'll follow up with them directly.\n\n"
            f"Appreciate it.\n\nBurke"
        )
        action = "Get referral name from reply, create new contact in HubSpot"

    elif intent == "OOO":
        subject = f"Re: {original_subject}"
        body = ""  # Don't reply to OOO
        action = "OOO — no response needed, pipeline will follow up automatically"

    elif intent == "UNSUBSCRIBE":
        subject = ""
        body = ""
        action = "REMOVE from all sequences immediately — do not reply"

    else:  # UNKNOWN
        subject = f"Re: {original_subject}"
        body = (
            f"Hi {first},\n\n"
            f"Thanks for getting back to me. Happy to connect whenever works for you — "
            f"here's my calendar: https://calendly.com/burke-theinterestinggroup\n\n"
            f"Burke\nThe Interesting Group | Buda, TX"
        )
        action = "REVIEW MANUALLY — intent unclear, draft is a safe fallback"

    return {
        "intent": intent,
        "subject": subject,
        "body": body,
        "action": action,
    }


def process_reply(reply: dict, prospect: dict) -> dict:
    """
    Full pipeline: classify → draft response → return package.
    reply: dict from gmail_agent.check_replies()
    prospect: dict from HubSpot/output files (for personalization)
    """
    body = reply.get("body", "")
    snippet = reply.get("snippet", "")
    original_subject = reply.get("subject", "")

    intent = classify_reply(body, snippet)
    response = draft_response(intent, prospect, original_subject)

    return {
        "reply_from": reply.get("from"),
        "reply_subject": reply.get("subject"),
        "reply_snippet": snippet[:200],
        "thread_id": reply.get("thread_id"),
        "message_id": reply.get("message_id"),
        "intent": intent,
        "draft_subject": response["subject"],
        "draft_body": response["body"],
        "action": response["action"],
        "prospect": prospect,
    }
