<!-- Meta doc: Skill system overview and examples. For Jarvis reference; usually no edits needed. -->

# Skill System Overview

A Skill is a reusable **capability pack**: it wraps "when to use, how to do it, what auxiliary files exist" under `runtime/skills/<name>/`, loaded on demand when tasks match.

## Why Skills exist

| Problem | Without Skill | With Skill |
|---------|---------------|------------|
| Browser automation | Re-discover commands and flow each turn | Read `agent-browser/SKILL.md`, follow snapshot-ref workflow |
| Creating a new Skill | Unsure of directory structure and front matter | Read `skill-creator/SKILL.md`, create per spec |
| Long documents | Stuff everything into Notes, context every turn | Body in `references/`, `read_file` when needed |

**Core principle**: Notes hold "short text to remember every turn"; Skills hold "full playbook for a class of work".

## Loading mechanism

1. **Index (always visible)**: System prompt `<SKILLS>` block lists each Skill's `name`, `description`, `path` (JSON)
2. **Body (on demand)**: When task matches `description`, `read_file` the `SKILL.md`
3. **Attached files (on demand)**: `references/`, `scripts/`, `assets/` etc. — paths in SKILL body, read or run when needed

After creating or editing a Skill, the index updates **next conversation turn**; no service restart needed.

## Directory structure

```
skills/<skill-name>/
├── SKILL.md          # Required: front matter + main flow
├── scripts/          # Optional: executable scripts
├── references/       # Optional: detailed reference docs
└── assets/           # Optional: templates, images, output assets
```

`SKILL.md` top YAML front matter must include:

```yaml
---
name: my-skill
description: What it does + when to trigger (be clear — system matches tasks on this)
---
```

## Real examples (built into this environment)

### 1. agent-browser — complex workflow type

- **Scenario**: User wants to open pages, fill forms, screenshot, scrape data
- **Why Skill**: Long flow, many commands, plus themed `references/` docs
- **How you use**: Match description → `read_file` `skills/agent-browser/SKILL.md` → follow snapshot-ref flow → read `references/commands.md` etc. when needed

### 2. tmux — medium workflow type

- **Scenario**: User wants long-running tasks in persistent terminal sessions
- **Why Skill**: Fixed command sequences and caveats, but not needed every turn
- **How you use**: Load when user mentions tmux / background session / detachable session

### 3. skill-creator — meta capability type

- **Scenario**: You need to **create or refactor** a Skill
- **Why Skill**: Teaches how to organize `scripts/`, `references/`, `assets/`
- **How you use**: User says "turn this into a skill" or you judge a task repeated ≥3 times with stable steps

### 4. find-skills / degit — tool integration type

- **Scenario**: User wants to install Skills from external ecosystem or pull template repos
- **Why Skill**: External CLI and specific params; not for SOUL
- **How you use**: User asks "is there an existing skill" or "pull template from GitHub"

## When to create a Skill (decision checklist)

Consider creating when **most** apply, instead of writing a Note:

- [ ] Same class of task has appeared or is expected to **recur**
- [ ] Steps ≥3 and order-sensitive, or depend on scripts/external CLI
- [ ] Body + references would exceed reasonable Note length
- [ ] Needs executable `scripts/` or large `references/`

Otherwise: update `notes/user.md` or create a short Note.

## When to update a Skill

- A step proves wrong or missing in practice → edit `SKILL.md` or `references/`
- Trigger scenario changed → **prioritize front matter `description`** (otherwise matching fails)
- Script paths or commands changed → sync `scripts/` and references in body

Creation flow: see `skills/skill-creator/SKILL.md`.
