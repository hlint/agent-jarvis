---
description: How to create and manage scheduled cron tasks
autoLoad: true
---

## Structure

- Each task lives in `cron-tasks/<task-name>/`.
- The task definition is in a `CRON.md` file within that directory.

## CRON.md Format

The file uses YAML front matter for settings and a Markdown body for the execution command.

**Required Fields:**
- `description`: Short summary of the task.
- `cronPattern`: Standard 5-field cron pattern (`min hour day month day-of-week`).
- `enabled`: `true` or `false`.

**Optional Fields:**
- `oneTimeOnly`: `true` if the task should run once and then be disabled.

## Verification

After creating or editing a task, I must call `list-cron-tasks` to confirm it is scheduled correctly.