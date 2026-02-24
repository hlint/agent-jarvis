---
description: Using attachment tool for files and direct URLs
autoLoad: true
---

## When to Use

- **Local file** or **direct file URL** (image, video link) → attachment tool
- **Web page URL** → embed in text: `[Reference](https://...)`

## Usage

**Local**: `attachment(type="local-file", path="...")`

- Relative path (no leading `/`): from runtime root, e.g. `projects/my-project/output/chart.png`
- Absolute path: system path, e.g. `/tmp/output.svg`

**Remote**: `attachment(type="remote-url", url="https://...")` for direct file resources only.

## Rules

- Never embed local file paths in body (`![](path)`). Use attachment tool.
- Small plain text: OK to put directly in reply.
