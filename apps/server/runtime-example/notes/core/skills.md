---
description: Skills—concept, format, loading
autoLoad: true
---

## Concept

- Modular knowledge in `skills/<name>/SKILL.md` for domain-specific capabilities.
- Names + descriptions are loaded each conversation; full body on demand.
- A skill name is **not** a **toolName** in **toolCalls**. When the body is missing or marked not loaded, read `skills/<name>/SKILL.md` with **[read-file]** before executing commands from that skill.

## Format

YAML front matter + Markdown. Fields: `name` (match dir), `description`. Use `##` sections, lists, **bold** for key terms.

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
