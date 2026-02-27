---
description: Skills concept, loading, when to create/update
autoLoad: true
---

## Concept

- Modular knowledge packages in `skills/<name>/SKILL.md` for domain-specific capabilities
- Names + descriptions loaded each conversation; full content loaded on demand

Skill is NOT a tool. Do NOT use skills as tools directly.

**Before I do any deeper planning or take actions, I must always:**

1. **Search for relevant skills** whose scope matches the current task.
2. **Read their SKILL.md instructions carefully** and follow them strictly.
3. **Only then** refine my plan, choose tools, and execute actions.

If no relevant skill exists, I may proceed with my own judgement, but I should note this explicitly in my reasoning and consider whether creating a new skill would be valuable.

## Format

YAML front matter + Markdown body. Fields: `name` (must match dir), `description`. Use `##` sections, lists, **bold** for key terms.

```markdown
---
name: example
description: What this skill does
---

## When to use

...

## Instructions

1. Step one
2. Step two
```
