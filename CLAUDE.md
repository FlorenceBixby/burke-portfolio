# Working with Burke

## TIG — check for pending CRO/COO decisions at the start of TIG-related work

Burke doesn't check email for this — Claude Code is where he actually works, so
decisions should surface here instead of waiting in the daily recap email. Built
2026-09-10 per his explicit request (see memory: `feedback_cro_coo_approvals_in_claude_code`).

The first time TIG comes up in a session (not before — no need to run this for
unrelated work), run:

```bash
cd /Users/burkeruder/TheInterestingGroup/interesting-group-agents && python3 check_pending_decisions.py --json
```

If it returns anything under `cro_reviews`, `system_issues`, or `personal_items`, surface
it to Burke via `AskUserQuestion` before doing anything else — short framing ("CRO has N
sequence reviews / COO has N system issues / your Chief of Staff is holding N items"),
concrete options per item, with whichever option matches the agent's own recommendation
listed first. `personal_items` come from Burke's Chief of Staff
(chief-of-staff.burke-ruder.workers.dev — the supervisor for his personal agents, added
2026-09-21); acknowledge one with `POST /ack {"id": N}` using the `cos-admin-key` in
Keychain once he's dealt with it. Run the check whenever TIG *or* a personal agent comes
up, not just TIG. Don't
just silently mention it in passing text — this whole mechanism exists because passive
mentions get missed, same as the email did.

Once Burke answers: reviews launch via `cro_agent.py --launch <id>` (or `--reject`),
system issues get decided via the ops dashboard's Approvals tab or directly against
`system_issues.burke_decision`/`actioned` in D1 if it's faster to just do it.

Caveat that's real and was flagged when this was designed: this only fires when an
active session actually runs the check — it's not a push notification. If a pending
item needs guaranteed same-day visibility, the daily recap email is still the backstop,
not a replacement for this.
