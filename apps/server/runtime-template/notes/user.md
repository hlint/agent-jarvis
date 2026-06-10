<!-- User profile Note: loaded in full every turn like other notes/*.md. Jarvis reads/writes and evolves this actively during interaction. -->
<!-- Maintenance: confirmed and valuable across sessions → write; stale → fix or delete; uncertain → keep (unknown) or do not write yet. -->

## First use · Information gathering

When many fields in this file are still "(unknown)", **show the survey proactively** — do not wait for the user to ask "what do you know about me". The survey is a point-and-click form on the whiteboard; it is quick and many people will fill it; your job is **to bring it up**, not to ask permission first.

### When to do it (early and proactive)

- **First or second conversation turn**, while the user is greeting, asking "who are you / what can you do", or chatting casually — that is the right time; do not wait until they hint or ask about profile
- User states their name (e.g. "I'm Hlint") → immediately `edit_file` to write "Preferred name"; remaining unknown fields still worth filling via survey
- User has an urgent task and fast pace → do the work first; bring up survey after the task settles
- User clearly refused or said "later" → do not repeat; supplement naturally in scattered conversation

### How to do it (act directly, no either/or)

**Do not** ask "Do you want to chat slowly or fill the survey?" "Which do you prefer?" — that puts the burden on the user; most will skip.

**Do** in one reply: briefly answer the current question + open the survey + one line on how to use it.

1. **`read_file` to confirm `.jarvis/onboarding-survey.html` exists and is valid** (system preset; do not modify `.jarvis/`)
2. **`navigate_whiteboard`** to open `.jarvis/onboarding-survey.html`
3. One line in chat, e.g.: "There is a one-minute point-and-click survey on the right — fill it and paste back when you can; skipping is fine, we'll learn as we go."
4. User pastes JSON → parse `_meta.intent === "user-onboarding"` → `edit_file` to update sections below
5. **After processing the survey, use `edit_file` to delete this entire "First use · Information gathering" section** (from `## First use · Information gathering` through before `## Basic info`) — onboarding is done; no need to inject this guidance every turn
6. If not filled, ignored, or user continues other topics → collaborate normally; do not nag

## Basic info

- **Preferred name**: (unknown)
- **Timezone**: (unknown)
- **Preferred language**: (unknown)

## Work context

- **Current project**: (unknown)
- **Tech stack**: (unknown)
- **Current focus**: (unknown)

## Communication preferences

- **Style preference**: concise, direct, minimal filler
- **Detail level**: (unknown — results for simple tasks; brief explanation acceptable for complex tasks)
- **Other**: (unknown)

## Environment and paths

- **Working directory**: (unknown)
- **Common tools/services**: (unknown)

## Important facts and long-term memory

(No entries yet. Information the user states explicitly, or you are confident is worth keeping after repeated collaboration, append here with `edit_file`; date or short context helps.)

## Notes

- **Taboos/sensitive topics**: (unknown)
- **Operational red lines**: (unknown — e.g. do not delete a directory, do not send email externally, etc.)
