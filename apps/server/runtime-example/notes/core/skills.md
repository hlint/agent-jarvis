---
description: Skills—concept, format, loading
autoLoad: true
---

## Concept

- Modular knowledge in `skills/<name>/SKILL.md` for domain-specific capabilities
- Names + descriptions loaded each conversation; full content on demand
- Skill is NOT a tool. Do not invoke skills as tools.

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
