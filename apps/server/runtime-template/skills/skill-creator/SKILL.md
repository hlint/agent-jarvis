---
name: skill-creator
description: Create or update skills. Use this when you need to design and structure a skill, or attach scripts, reference documents, and asset files to it.
---

# Skill creation

This skill explains how to create effective skills and **encourages storing supporting files inside the skill directory**, so that `SKILL.md` plus its sibling files form a complete skill package.

## Skill directory structure

Each skill has its own directory. It must contain `SKILL.md`, and can optionally contain the following subdirectories or files:

```
skills/<skill-name>/
├── SKILL.md          (required) front matter + main documentation
├── scripts/          (optional) executable scripts, used via [exec]
├── references/       (optional) reference docs, loaded on demand via [read-file]
└── assets/           (optional) templates, images, etc., used as outputs and usually not read into context
```

- **`scripts/`**: Put scripts here (for example, Python or Shell) when you need stable, repeatable execution. The AI uses `[exec]` within the skill directory to run them, avoiding rewriting the same code every time.
- **`references/`**: Longer or occasionally needed documents (API docs, database schemas, policy descriptions). In the main text, point to them explicitly, for example “see `references/xxx.md`”, and have the AI use `[read-file]` only when needed.
- **`assets/`**: Files used to produce outputs (templates, logos, fonts, etc.). They are not read into the context; they are just sources for writing or copying files.

Guiding principle: **keep `SKILL.md` concise**. Describe the workflow and when to use which supporting files; move detailed explanations and large reference material into `references/` or scripts to avoid overloading the context.

## Naming and format

- The directory name should match the skill name: lowercase letters, digits, and hyphens (for example, `skill-creator`, `pdf-rotate`).
- At the top of `SKILL.md`, the YAML front matter must include `name` and `description`. The `description` should clearly state what the skill does and when it should be triggered, so the system can match it correctly.
- The body should be Markdown, structured with `##` headings, and use lists or code blocks for key steps.

## Creation workflow (using file tools)

1. **Define the purpose**: What problem does the skill solve, and in which scenarios should it be triggered?
2. **Plan supporting files**: Decide what belongs in `scripts/` (executable), `references/` (read on demand), and `assets/` (used for outputs).
3. **Create directories and files**: Use `[write-file]` to create `skills/<name>/SKILL.md`, and, as needed, files under `scripts/`, `references/`, and `assets/` (for example, `scripts/rotate.py`, `references/schema.md`).
4. **Write `SKILL.md`**: In the front matter `description`, fully describe “what it does + when to use it”. In the body, document the workflow, when to use scripts/references/assets, and their paths (for example, “run `scripts/xxx.js` with the working directory set to the current skill directory”).
5. **Iterate**: Refine the main text and supporting files based on real usage.

## What not to include

Only store content directly related to executing the skill in the skill directory. Do not add extra documentation such as separate READMEs, installation guides, or changelogs.
