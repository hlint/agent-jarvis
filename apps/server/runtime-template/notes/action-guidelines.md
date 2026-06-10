<!-- Purpose: Prepare, act, wrap-up, and report guidelines within a single tool loop. -->

# Action Guidelines

Each user request completes four steps in one tool loop: **Prepare → Act → Wrap-up → Report**.

| Phase       | Core question                                               |
| ----------- | ----------------------------------------------------------- |
| **Prepare** | What does the user want? How? What do I need?               |
| **Act**     | Follow the board; adjust when blocked                       |
| **Wrap-up** | Is the result reliable? Is everything saved that should be? |
| **Report**  | Is the user's question fully answered?                      |

> **The route may change**: When scope shifts, use a new **`setup_plan`** to replace the board; do not mechanically execute stale steps.

---

## Task board (setup_plan)

Each user message gets a **turn-only** task board stored in the session; it clears automatically at the start of a new message. The runtime prompt appends the current board at the end.

### Hard flow (system enforced)

1. **First loop**: You may **reply with text only** and finish (no `setup_plan` required for simple answers)
2. **If you call tools in the first loop**, the call must be **`setup_plan`** — before the first successful `setup_plan`, only `setup_plan` is available; other tools appear under `<DISABLED_TOOLS>` at prompt end (temporarily disabled, for prepare-phase reference)
3. After the board is established, other tools unlock; you may **`setup_plan` again anytime** to rewrite the board

### Not a checklist gate

- There is **no** hard rule that the board must be "complete" before delivery
- The board is your task board, not a tick list
- You need not tick steps one by one; delivery need not "complete all steps"

### How to write a plan

Use a **Markdown list string**; simple tasks need only a few bullets. **Complex coding tasks** should split into the four phases with nested sub-steps (indent sub-items two spaces):

```markdown
- **Prepare**
  - Check `<SKILLS>` index, read_file relevant SKILL.md (e.g. skills/cron/SKILL.md)
  - Read workspace/order-api routes, models, README; understand existing structure
  - Align success criteria: cron scheduled CSV export; manual curl verifiable; tests pass
- **Act**
  - Implement export handler (fields, empty data, Content-Type)
  - Write cron-tasks definition per Skill convention and register scheduled task
  - Add/update unit tests; exec test suite, fix until pass
- **Wrap-up**
  - read_file handler, cron task file, tests, README changes
  - Confirm artifacts in workspace/order-api/ and cron-tasks/, nothing outside runtime
  - Delete tmp scratch; stop dev server / background processes started this turn
- **Report**
  - Tell user: cron expression, manual verification (sample curl), test results, changed files list
```

Simple task example (no four blocks needed):

```markdown
- Goal: answer fleet-ops registered vehicle count
- Read workspace/fleet-ops/status.txt
- Report number to user
```

### Execution order

```
(simple) text-only reply → done
OR
setup_plan (when tools are needed)
  → Act per board (other tools allowed)
  → (optional) scope changed → setup_plan again
  → Wrap-up
  → Report to user
```

**Forbidden**: Call read/write/exec (or any tool other than `setup_plan`) before the first successful `setup_plan` (system blocks non-setup_plan tools in the plan phase).

---

## 1. Prepare

**Prepare = the "Prepare" block in `setup_plan` + the board overall** (when you use tools). For tool-using turns, build the board first, then act; the board should reflect Skills, Notes, and Workspace paths to read.

| Point            | What to do                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------- |
| Clarify intent   | Board states what the user wants and success criteria                                         |
| Step granularity | Simple task may be 1 item; multi-step, cross-module, destructive risk → split into list items |
| Gather resources | Read Skill, Note, Workspace, config; **do not ask user for what you can look up**             |
| Choose means     | Live info/files/commands/status → must use tools, no guessing                                 |

---

## 2. Act

Follow the board; when you drift, **`setup_plan` update**, then continue.

- **Focus on this turn's goal**: no unrelated expansion.
- **Correct as you go**: after each phase, decide if the board needs updating.
- **Evidence before conclusions**: for debugging, avoid guesses without logs or reproduction.
- **Tools first**: when live or local state is needed, call tools; do not invent from memory.
- **Path awareness**: long-running project artifacts go in `workspace/<slug>/`; see `notes/workspace.md`; do not write outside runtime.
- **Confirm structure before write**: before `write_file`, `edit_file`, or `append_to_file` under `workspace/` (or any path that may belong to an existing project tree), call **`read_dir`** on `workspace/` or the target's parent directory — verify slug, sibling projects, and existing files match intent. `write_file` overwrites same-path files; skipping this step often overwrites another project's files.
- **Prefer small, targeted file changes**: avoid `write_file` with a huge body that mostly repeats an existing file. Use **`edit_file`** for local patches; use **`exec`** `cp` to duplicate a template then `edit_file` the diff; use **`exec`** `mv` to rename or relocate — do not read entire large files back into context only to rewrite them unchanged.

---

## 3. Wrap-up

Before reporting to the user, quickly verify delivery (item by item for complex tasks; minimal for simple ones).

| Category          | What to do                                                       |
| ----------------- | ---------------------------------------------------------------- |
| Confirm result    | Read back changes, run tests/lint, smoke verify                  |
| Persist           | Files and Notes that should remain are on disk                   |
| Clean up          | Delete tmp, junk, intermediate-only files this turn              |
| Release resources | Close background processes, browser, dev server no longer needed |
| Session title     | **`basic` session**: `rename_session` to reflect topic           |

Subagents have no `rename_session`; cross-session info must go to Workspace / Note, not only in conversation.

### Subagent

Subagents follow the same plan-phase rules: text-only reply or **`setup_plan` before other tools**; session cannot be recovered after end; clean up temporary resources this turn.

---

## 4. Report

After wrap-up, **answer the user in body text** — cover all sub-questions, focus on results, do not read the board aloud.

---

## Common mistakes

- **Calling tools other than `setup_plan`** before the board exists (system blocks in plan phase)
- Complex task board too coarse; **did not read_file relevant Skill in prepare phase**
- Only calling tools without a report, or missing user sub-questions
- Scope changed but board not updated; mechanically executing stale steps
- Project files written outside `workspace/` or wrong path guessed
- **`write_file` / `edit_file` without prior `read_dir`** — overwrote an existing file or another project's path
- **Full `write_file` of near-duplicate content** — wasted tokens and risked clobbering unrelated sections; should have used `cp` + `edit_file`, or `mv`, or a minimal `edit_file` hunk
- **Subagent**: artifacts only in session about to be destroyed; not persisted to Workspace / Note
