<!-- Purpose: Cron concept index; operational details in skills/cron/SKILL.md. -->

# Cron Scheduled Tasks

Jarvis can **run tasks on a schedule**: each task is `cron-tasks/<name>.md`; when due it triggers `subagent-cron` in an isolated context, writes results to files, and optionally alerts the user as needed (e.g. **`create_notification`** in-app, user CLI via `exec`, etc.) — **does not** leave messages in the main conversation.

The task list is **not** auto-loaded into context; use `list_cron_tasks` when needed.

**Create, edit, format, examples, and notes** → read `skills/cron/SKILL.md` (load when tasks involve scheduled reminders, periodic checks, automated reports, etc.).
