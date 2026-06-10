---
name: cron
description: Create, edit, or troubleshoot scheduled cron tasks in cron-tasks/*.md. Use when the user asks for reminders, periodic checks, automated reports, or any time-based automation managed by Jarvis.
---

# Cron Scheduled Tasks

Jarvis runs tasks automatically on a **cron expression**. Task definitions live in `cron-tasks/<name>.md`; **the list is not auto-injected into context** — use `list_cron_tasks` to see current state, then `read_file` / `write_file` / `edit_file` to manage.

## How it works

1. One Markdown file per task: `cron-tasks/daily-backup-check.md`
2. **YAML front matter** holds schedule metadata; **body** is the instruction passed to the subagent when triggered
3. When due → create `subagent-cron` session → run full agent loop → session deleted (recycle bin)
4. After modifying or adding task files, scheduler hot-reloads automatically (~100ms debounce)

## Task file format

```markdown
---
description: Short summary for list_cron_tasks
cronPattern: 0 9 * * *
enabled: true
oneTimeOnly: false
---

Write instructions for the agent when this task fires.
Use imperative sentences. Say where to write results.
```

| Field          | Description                                                           |
| -------------- | --------------------------------------------------------------------- |
| `description`  | Short summary in `list_cron_tasks`; **quote if it contains `:`** (e.g. `description: "Daily: disk check"`) |
| `cronPattern`  | Standard 5-field cron: `minute hour day month weekday` (e.g. `0 9 * * *` = daily 9:00) |
| `enabled`      | `true` enabled / `false` paused                                       |
| `oneTimeOnly`  | When `true`, after one run automatically sets `enabled` to `false`    |

Filename is the task name (without `.md`); prefer lowercase with hyphens, e.g. `weekly-report.md`.

**Path**: Task files must be **`cron-tasks/<name>.md`** (under runtime root), **not** `runtime-template/` or other directories.

## Management and queries

| Action           | Method                                  |
| ---------------- | --------------------------------------- |
| List all tasks   | `list_cron_tasks`                       |
| Create task      | `write_file` → `cron-tasks/<name>.md`   |
| Edit schedule/enable | `edit_file` front matter or body    |
| Pause            | Set `enabled` to `false`                |
| Delete           | Delete the `.md` file                   |

After create or edit **must** call `list_cron_tasks` to confirm loaded (tool reads disk live); check `enabled`, `nextTriggerTime`; if `loadError`, fix front matter (common cause: unquoted colon in `description`).

## Execution when triggered

Runs in **`subagent-cron` mode** (see `notes/subagent.md`). **Does not** leave messages in main conversation. Delivery per task and user preference; common combinations:

| Method | When |
| ------ | ---- |
| **Write files** | Default; reports, logs, persistent records (`workspace/` etc.) |
| **`create_notification`** | Optional; lightweight in-app sidebar alert (one-line summary, not the only notification channel) |
| **`exec` user CLI** | Optional; when task body or user explicitly requires (e.g. `notify-send`, custom email/webhook script) |

Detailed results should still be written to files; in-app or CLI notifications only say "go look".

## Body writing tips

- State **what to do, where to write, what to do on failure**
- Specify output format (append log line / overwrite report / JSON etc.)
- When user should be alerted: choose **write file**, **`create_notification`** (in-app summary), **`exec` CLI** per body or user config — **do not** assume only one way; **do not** message main conversation
- Detailed reports and logs go to files; `create_notification` and CLI alerts carry short summary or trigger external channel
- Keep single-task scope bounded; avoid long dependency chains

## Examples

### Daily disk check

`cron-tasks/disk-check.md`:

```markdown
---
description: Daily disk usage snapshot
cronPattern: 0 8 * * *
enabled: true
oneTimeOnly: false
---

Run `df -h`, append a dated section to `workspace/ops/disk-log.md`.
If any mount exceeds 90%, alert the user — e.g. `create_notification` with a one-line summary, or exec the user's script if the task says so: `~/bin/jarvis-alert "Disk high"`.
```

### One-time reminder

```markdown
---
description: Remind to renew certificate
cronPattern: 0 10 1 3 *
enabled: true
oneTimeOnly: true
---

Append a reminder line to `workspace/ops/reminders.md` about TLS cert renewal.
Optionally alert the user — e.g. `create_notification` with a short reminder, or `notify-send` / user's notify CLI if configured in the task.
```

## vs call_subagent

|            | Cron                | call_subagent     |
| ---------- | ------------------- | ----------------- |
| Trigger    | Schedule automatic  | Main agent calls  |
| Result return | None (write file / exec) | Returns to main agent |
| User visibility | Files / in-app notify / user CLI etc. | Visible in current conversation |
