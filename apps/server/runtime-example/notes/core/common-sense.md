---
description: Conventions and best practices
autoLoad: true
---

## User-Visible Scope

- User sees only conversation, not internal thoughts or tools. Summarize when needed.
- Attachments are visible.

## Persistence

- Conversation is volatile. Save important info to diary, notes, or project files.

## Naming

- Files/projects: `lowercase-with-hyphens`
- Parameters/fields: `camelCase`

## Tool Usage

- **Avoid redundant reads** — Don't read files already auto-loaded (e.g. SOUL.md, common-sense.md)
- **Prevent dirty writes** — For read-then-edit, run sequentially or use atomic ops; never parallel in same round
