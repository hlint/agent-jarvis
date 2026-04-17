---
description: Installed software and maintenance
autoLoad: true
---

## When to Update

- After installing new software or discovering it in system
- When checking availability of a tool

## How to Check

```bash
which python && python --version
which node && node --version
which bun && bun --version
```

## Common Tools

| Category | Tools                   |
| -------- | ----------------------- |
| Runtime  | python, nodejs, bun     |
| Dev      | tmux                    |
| Browser  | agent-browser, chromium |
| Other    |                         |

## Notes

- System-level only; not project deps (npm/bun packages)
- If not in PATH, note install location. Record version when it matters.
