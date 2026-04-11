---
description: Notes concept and loading
autoLoad: true
---

## Concept

Notes are Markdown files under `notes/`. Your persistent memory for knowledge and experience—stable facts, conventions, and playbooks that should survive beyond one reply.

## Loading

- **autoLoad=true**: Full content is always loaded into context. Use only for short, stable, high-signal notes you want the agent to see every time.
- **autoLoad=false**: Only path and description are loaded; open the note explicitly when needed.

## Format

YAML front matter: `description`, `autoLoad`. Body = note content.
