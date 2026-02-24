---
description: Skills concept, loading, when to create/update
autoLoad: true
---

## Concept

- Modular knowledge packages in `skills/<name>/SKILL.md` for domain-specific capabilities
- Names + descriptions loaded each conversation; full content loaded on demand

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
