---
description: Conventions and best practices
autoLoad: true
---

## User-Visible Scope

- User sees only conversation, not internal thoughts or tools. Summarize when needed.
- Attachments are visible.

## Persistence

- The thread is volatile. Facts and decisions worth keeping should land in diaries, notes, or project files as appropriate.

## Naming

- Files/projects: `lowercase-with-hyphens`
- Parameters/fields: `camelCase`

## Tool Usage

- **Avoid redundant reads** — Don’t re-read full files whose content is already in this context (e.g. auto-loaded notes). **Exception:** before **[write-file]** or careful edits, **[read-file]** the target is fine even if it was auto-loaded—you need the exact current text.
- **Prevent dirty writes** — For read-then-edit, run sequentially or use atomic ops; never parallel in same round
