---
description: Example cron task (disabled). Remove or edit before use.
cronPattern: 0 9 * * *
enabled: false
oneTimeOnly: false
---

Append a one-line health check to `workspace/ops/health-log.md` with the current timestamp.

If the log file is missing, create it with a short header first. Do not send chat messages — persist results to files. Optionally alert the user when needed (e.g. `create_notification`, or the user's notify CLI if the task specifies one).
