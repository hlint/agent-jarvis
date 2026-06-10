<!-- Purpose: Defines runtime/workspace positioning, directory conventions, and division with Notes / Sessions. -->

# Workspace

`runtime/workspace/` is the **persistent work area for projects and long-running tasks** — directories, files, and state that must survive across sessions and conversations, separate from single-session ephemeral context.

## Background

The runtime already has clear roles, but lacked a **place to do the work**:

| Area        | Characteristics                                              | Limitations                                            |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| `sessions/` | Per-conversation isolation; messages, attachments, artifacts | Session-scoped; deleting session goes to recycle-bin   |
| `notes/`    | Short text, full text in context every turn                  | Not for large files, directory trees, binary artifacts |
| `skills/`   | Reusable workflow playbooks                                  | Not for project data storage                           |
| `tmp/`      | Temporary files                                              | Should not hold long-term memory                       |

**Workspace** fills this gap: ongoing user projects, long tasks, and phased deliverables have a stable home.

## Positioning (one line)

> **Notes record "what to know"; Workspace stores "what to use and how far you've gotten".**

## Recommended directory structure

```
runtime/workspace/
├── <project-slug>/           # One project or long-task domain
│   ├── README.md             # Project charter: goals, status, key links, current focus
│   ├── tasks/                # Task lists, progress, checkpoints (markdown or json)
│   └── data/                 # Artifacts, exports, cache, cloned subdirs, etc.
└── ...
```

Naming conventions:

- `<project-slug>`: lowercase, hyphenated, self-explanatory, e.g. `agent-jarvis`, `q2-report`
- Do not scatter files at workspace root; everything goes under a slug directory
- Each slug directory **should have** `README.md` (even if initially only three lines)

## How to combine with Note / Session

| Content                                                                   | Where                                                        |
| ------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Who the user is, communication preferences                                | `notes/user.md`                                              |
| These workspace rules themselves                                          | `notes/workspace.md` (this file)                             |
| A project's "what we're doing now, what's next" (short, often referenced) | Summary in `notes/` **or** only `workspace/<slug>/README.md` |
| Large files, script output, datasets, cloned repos                        | `workspace/<slug>/data/`                                     |
| Long-task step progress, todos                                            | `workspace/<slug>/tasks/`                                    |
| Single-conversation uploads, turn artifacts                               | `sessions/<id>/attachments                                   | artifacts`; **worth keeping long-term** → copy or migrate to workspace |

**Principle**: Session is the flow; Workspace is the warehouse. Valuable artifacts from a session — consider archiving to workspace when the task ends.

## Typical usage ( envisioned )

1. **Multi-week project**: `workspace/my-app/README.md` tracks milestones; `tasks/backlog.md` tracks todos; `data/` holds build logs, screenshots
2. **Long research**: `workspace/research-topic/data/` accumulates excerpts and exports; Note holds only conclusion summary
3. **Recurring maintenance** (e.g. weekly report): workspace holds templates and historical output; Skill holds the process

## Current state

- Directory: `runtime/workspace/` (created with template on init, may be empty)
- No enforced schema yet; evolves with use; README + tasks + data is the recommended starting split
- Active project list: (none yet — append below when projects exist)

## When to update

- User proposes new workspace usage or directory conventions → update "Positioning / recommended structure / combination" in this Note
- Create or archive a long-running project → append slug and one-line description under "Current state"; write details in `workspace/<slug>/README.md`
- Note and workspace roles overlap or conflict → fix the division table in this Note and migrate content to the right place
- Project finished → remove or mark archived in active list; directory may remain or move to recycle-bin (user confirmation required)

## Notes

- Do not use workspace as a dump; `data/` only keeps files with **reuse or audit value**
- Confirm before destructive delete or overwrite of existing workspace artifacts
- Long playbooks still belong in Skills; workspace only holds **that project instance** data and progress
- Keep this Note concise; project details live in each `workspace/<slug>/README.md` to avoid loading too much every turn
