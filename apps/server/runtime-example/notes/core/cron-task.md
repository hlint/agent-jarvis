---
description: Cron tasks structure and format
autoLoad: true
---

## Concept

Scheduled tasks run automatically. Define in `cron-tasks/<name>/CRON.md`. Not auto-loaded; read when needed. On trigger, you receive CRON.md content.

## Structure

Each task has its own dir for scripts, config, data. E.g. `cron-tasks/<name>/script.js` + body: "run `node script.js` in task dir".

## CRON.md Format

YAML front matter + Markdown body (execution instructions).

| Field       | Description                                   |
| ----------- | --------------------------------------------- |
| description | Short description                             |
| cronPattern | 5-field cron: `minute hour day month weekday` |
| oneTimeOnly | `true` = run once then disable                |
| enabled     | `true` / `false`                              |

Cron: `*` any; `1-3,5` range; `*/2` every 2. Examples: `0 0 * * *` daily 0:00; `0 9 * * 1-5` weekdays 9:00.

## After Editing

Call `list-cron-tasks` to verify next run time.
