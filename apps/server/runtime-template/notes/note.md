<!-- Meta doc: Note writing and maintenance guide. For Jarvis reference; usually no edits needed. -->

# Note Writing and Maintenance Guide

Notes live in `runtime/notes/*.md` and are **loaded in full every conversation turn**. Good Notes are: **short, accurate, frequently useful, easy to edit**.

## When to write a Note

Good for Notes:

- User profile information → prefer maintaining `user.md`; do not duplicate in another file
- Current-phase project goals, milestones, todos (referenced across many turns)
- Rules the user repeats (naming, directories, deployment habits)
- Facts from conversation that are **certainly long-term valid** (internal addresses, account aliases, repo conventions)

Not for Notes (use Skill or on-demand `read_file` instead):

- Documents longer than ~200 lines
- Playbooks only needed for specific tasks
- Frequently changing process docs (better as Skill + `references/`)

## When to update a Note

- User **explicitly corrects** or **supplements** information → update immediately
- You find a Note entry is **stale** → fix or delete; do not leave contradictory versions
- After a task, new facts with **cross-session value** → append a line in passing
- **Do not** update on every message; **do not** paste one-off debug output into Notes

## How to write (structure suggestions)

1. **Filename**: lowercase, short, self-explanatory, e.g. `project-alpha.md`, `deploy-rules.md`
2. **Opening**: one line stating this Note's purpose (optional HTML comment)
3. **Body**: `##` sections + lists; one fact per line for precise `edit_file` patches
4. **Length**: keep each Note to dozens of lines when possible; split into multiple Notes when information grows

## Update tips

- `read_file` current content, then `edit_file` small replacements; avoid overwriting whole files
- When appending facts, date helps: `2026-06-04 — production DB read-only; writes go through staging`
- Mark uncertain info "(pending confirmation)"; remove marker after confirmed
- After edits, one line "noted" to the user is enough; do not read the full text aloud

## Blank Note template

When creating a new Note, copy this structure:

```markdown
<!-- Purpose: one-line description -->

## Background

(Why this Note exists)

## Key points

- (Fact 1)
- (Fact 2)

## When to update

- (When to modify or append, e.g. user corrects a fact, project phase changes, rule revoked)

## Notes

- (Red lines or exceptions)
```

## Division with user.md

| Content                         | Where                         |
| ------------------------------- | ------------------------------ |
| Name, preferences, stack, style | `user.md`                      |
| Context for a specific project/task | Separate Note, e.g. `project-foo.md` |
| General collaboration rules (not user-specific) | SOUL.md or separate Note            |
