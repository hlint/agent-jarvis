---
description: How to use the exec tool effectively
autoLoad: true
---

## Behavior

- One command per call via shell (`sh -c` / `cmd /c`). `cwd` optional (relative to runtime).
- Returns stdout, stderr, exitCode; ~20s timeout, then killed.
- **No TTY, no stdin** — commands that wait for input will block or fail.

## Shell Chaining

- `&&` — run next only if previous succeeds
- `;` — run next regardless of exit code
- `|` — pipe stdout to next
- `||` — run next only if previous fails
- `(...)` — subshell

Quoting: single quotes for literals; double when expansion needed. Escape `$`, `"`, `\`.

## Avoid

Commands that block without TTY/stdin:

- `vim`, `nano`, `less` → use `sed`, `echo`, `cat`
- `npm init` → `npm init -y`
- `python` REPL → `python -c "..."`
- Prompts → pipe `yes` or use `-y` / `--yes`

## Long-Running

Commands >20s are killed. **Use tmux**: detached session, attach to view, `tmux kill-session` to stop.

**When** — servers, watchers, or anything needing output/interaction later; interactive commands requiring TTY.

See skill `using-tmux-for-interactive-commands`.

## Quick Reference

| Scenario      | Approach                                           |
| ------------- | -------------------------------------------------- | ------ |
| Quick one-off | `exec "cmd"`                                       |
| Sequential    | `exec "cmd1 && cmd2"`                              |
| Pipe          | `exec "cmd1                                        | cmd2"` |
| Long-running  | `exec "tmux new-session -d -s name 'npm run dev'"` |
| Prompts       | `exec "npm init -y"` or `exec "yes                 | cmd"`  |
| Edit file     | Use `edit-file`, not vim/nano                      |
