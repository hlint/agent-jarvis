<!-- Purpose: Whiteboard concept, capabilities, and Agent/user collaboration. -->

# Whiteboard

## What it is

The whiteboard is an **iframe panel on the right** of the UI, showing **HTML files** under runtime. Each session maintains its own whiteboard URL (`whiteboardPath`); switching sessions switches whiteboard content.

Default home: `home.html` (runtime root).

## How users use it

- Enter a runtime-relative path in the address bar (e.g. `workspace/demo.html`) and press Enter
- Click refresh to reload the current page
- Click home to return to `home.html`
- On mobile, open/close the whiteboard overlay from the chat toolbar

## How the Agent uses it

**Before creating or editing whiteboard HTML (required)**: first `read_file` → `skills/whiteboard-html/SKILL.md`. Do not call `write_file` / `edit_file` on whiteboard-related `.html` before reading the body. If the task involves patterns not covered in the Skill body, read docs under `skills/whiteboard-html/references/` as needed.

1. **Read Skill** → confirm dark theme, stack, layout, examples
2. **Write HTML** → `write_file` / `edit_file` (common path `workspace/`)
3. **Navigate whiteboard** → `navigate_whiteboard` to target HTML; same path **refreshes** the iframe
4. **Let user see it** → after navigate, briefly say "opened xxx on whiteboard"; do not paste full HTML

## Data flow

| Action | Mechanism |
|--------|-----------|
| User changes address bar | `POST /jarvis/whiteboard-path` → update session → WebSocket sync |
| Agent navigates | `navigate_whiteboard` tool → same as above |
| Page calls `jarvis.navigate(path)` | iframe `postMessage` → parent updates path + opens panel |
| Render page | iframe requests `GET /jarvis/file?path=...` |

## Multi-page HTML apps

- Iframe **fully reloads** on navigation — no shared in-memory state between pages
- Flows with shared state → **one HTML file** with steps/tabs, or **shared JSON** under `workspace/<slug>/data/`
- Links between pages → `jarvis.navigate("workspace/other.html")` (see `skills/whiteboard-html/SKILL.md`)
- Before navigating away, `jarvis.flushWrite(...)` so the next page reads saved data

## Path conventions

- Use **runtime-relative paths**, forward slashes, e.g. `workspace/chart.html`
- File must exist under runtime; after creating a file you may call `navigate_whiteboard` directly
- Interactive pages prefer single-file HTML; **spec and templates in Skill** `skills/whiteboard-html/SKILL.md` (read before editing)

## When to use the whiteboard

- Visual results: charts, forms, mini games, dashboards
- UI prototypes where the user **views and edits while looking**
- Long content that does not fit chat bubbles well

## Notes

- **Read Skill before writing HTML** (see "How the Agent uses it" above)
- Whiteboard state is **per session**, not global
- Same HTML may be referenced by multiple sessions; each session's navigation is independent
- Refresh depends on `whiteboardRevision` increment; Agent navigating the same path again also triggers refresh
