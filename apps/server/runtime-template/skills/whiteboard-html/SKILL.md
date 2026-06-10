---
name: whiteboard-html
description: Create or update single-file HTML pages for the Jarvis whiteboard iframe. Use when building interactive dashboards, demos, forms, or visual results shown in the right-side whiteboard panel. MUST read this SKILL.md before any write_file or edit_file on whiteboard HTML.
---

# Whiteboard HTML Pages

## Overview

The whiteboard renders **local HTML files** from runtime via `GET /jarvis/file?path=...`. Prefer **one self-contained `.html` file** per page.

Default home: `home.html`.

## Basic rules

- **One `.html` file** per page; **theme follows the main Jarvis UI** via shared bootstrap JS.
- **Saved state** → `window.jarvis.read` / `window.jarvis.writeTextFile` on runtime paths (e.g. `workspace/<slug>/data/*.json`). **Do not** use `localStorage` / `sessionStorage` / `indexedDB` — Agent cannot read browser storage.
- **Static UI-only** pages may keep data in memory; see `references/` for patterns.
- **Icons** — use bootstrap `lucide` dep where they help UX; see Icons below. Other decorative assets (images, fonts) are **not recommended**.
- After `write_file`, call **`navigate_whiteboard`**.

## Quick workflow

1. `write_file` → save HTML (e.g. `workspace/demo.html`)
2. `navigate_whiteboard` → open in the user's whiteboard
3. Re-navigate same path to refresh after edits

## Multi-page navigation

The whiteboard iframe **reloads on every navigation** — in-memory state is lost. Plan accordingly:

| Pattern                               | When                                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------------------- |
| **Single HTML, multi-step / tabs**    | Flow shares state (wizard, form steps) — prefer one file                               |
| **Multiple HTML files + shared JSON** | Separate screens; all pages read/write `workspace/<slug>/data/*.json`                  |
| **`jarvis.navigate(path)`**           | In-page links/buttons between HTML files (do not use `<a href>` to other runtime HTML) |

**Internal page jump (between whiteboard HTML files):** always use `jarvis.navigate()` in JavaScript — links, buttons, and programmatic redirects included. **Never** use `<a href>`, `window.location`, or other native navigation for runtime HTML paths.

```javascript
// Persist first if the next page needs current data
await jarvis.flushWrite("workspace/myapp/data/state.json");
jarvis.navigate("workspace/myapp/detail.html?id=" + itemId);
```

```jsx
<button
  type="button"
  onClick={() => jarvis.navigate("workspace/myapp/list.html")}
>
  Back to list
</button>
```

- Path is **runtime-relative** (same as address bar); query strings allowed (`?id=…`)
- `jarvis.navigate()` posts to the parent shell — same effect as the user typing in the address bar
- **Do not** use `localStorage` for cross-page state; share data via `workspace/<slug>/data/*.json` instead

**Agent-created multi-page apps:** put shared data under one `workspace/<slug>/data/` directory; document paths in HTML comments or a small `manifest.json` if helpful.

## Bootstrap (required)

Include **one script** in `<head>`. It loads theme CSS, optional CDN deps, Tailwind config, and `window.jarvis` helpers:

```html
<script
  src="/jarvis/file?path=.jarvis/whiteboard/bootstrap.js"
  data-jarvis-deps="tailwind,react,babel"
></script>
```

| `data-jarvis-deps` value | Loads                                                        |
| ------------------------ | ------------------------------------------------------------ |
| `css`                    | Jarvis theme tokens + scrollbars (**auto-included**)         |
| `tailwind`               | Tailwind Play CDN + semantic color config                    |
| `react`                  | React 18 + ReactDOM UMD                                      |
| `babel`                  | Babel standalone (required for JSX)                          |
| `zod`                    | Zod 3 UMD                                                    |
| `lucide`                 | Lucide 1.17.0 icons (`data-lucide` + `jarvis.createIcons()`) |
| `echarts`                | ECharts 6.1.0                                                |
| `hljs`                   | highlight.js 11.11.1 CSS + core + JSON language              |

Pinned versions live in `.jarvis/whiteboard/bootstrap.js` (`jarvis.CDN`). Current set: Tailwind Play CDN 3.4.17, React 18.3.1, Babel 7.29.7, Zod 3.23.8, ECharts 6.1.0, Lucide 1.17.0, highlight.js 11.11.1. (Play CDN only supports v3 path pins — do not use `4.x` in the URL.)

**Do not** hardcode `<html class="dark">`, inline theme CSS, inline `tailwind.config`, or manual CDN `<script>` / `<link>` tags for deps listed above.

React/JSX app code goes in `<script type="text/babel">` at end of `<body>`. Include `babel` in `data-jarvis-deps`; bootstrap **always loads `babel` last** and compiles these scripts only after Zod, Lucide, and other deps are ready.

## Theme colors (use only these)

Bootstrap loads CSS + Tailwind config internally. **Do not** use raw hex, `bg-white`, `bg-gray-*`, etc. Stick to semantic tokens (light/dark values switch automatically):

| Token         | Tailwind examples                                          |
| ------------- | ---------------------------------------------------------- |
| `background`  | `bg-background`                                            |
| `foreground`  | `text-foreground`                                          |
| `card`        | `bg-card`, `text-card-foreground`                          |
| `primary`     | `bg-primary`, `text-primary`, `text-primary-foreground`    |
| `secondary`   | `bg-secondary`, `text-secondary-foreground`                |
| `muted`       | `bg-muted`, `text-muted-foreground`                        |
| `accent`      | `bg-accent`, `text-accent-foreground`                      |
| `destructive` | `bg-destructive`, `text-destructive`, `border-destructive` |
| `border`      | `border-border`                                            |
| `input`       | `border-input`, `bg-input`                                 |
| `ring`        | `ring-ring`, `focus:ring-ring/40`                          |

Opacity modifiers are allowed: `bg-primary/80`, `border-border/60`, `bg-destructive/10`.

Border radius: `rounded-sm`, `rounded-md`, `rounded-lg` (from `--radius`).

Runtime reference: `jarvis.theme.tokens` / `jarvis.theme.tailwind` on the whiteboard page.

## Icons (Lucide)

Add `lucide` to `data-jarvis-deps`. Bootstrap loads Lucide **1.17.0** — do not add your own `<script src="https://unpkg.com/lucide@latest">` or other unpinned CDN tags for deps listed in the bootstrap table below.

**Static HTML** — place icons in markup; bootstrap calls `createIcons()` after init:

```html
<i data-lucide="clipboard-copy" class="size-4 text-primary"></i>
```

**React / JSX** — do **not** use `<i data-lucide>` in JSX (`createIcons` mutates the DOM and breaks React reconciliation). Use the bootstrap component:

```jsx
const LucideIcon = jarvis.LucideIcon;
// ...
<LucideIcon name="clipboard-copy" className="size-4 text-primary" />;
```

Requires `react` + `lucide` in `data-jarvis-deps`. Available after `jarvis.init()` / auto-bootstrap completes.

Use icons sparingly — section headers, primary actions, status affordances. Skip decorative clutter.

**Verify icon names** before use (returns Not Found if missing):

```
curl -s https://unpkg.com/lucide-static@1.17.0/icons/volume-2.svg
```

Replace `volume-2` with the icon name. On a loaded page: `jarvis.lucideStaticBase + "/volume-2.svg"`. Browse names at [lucide.dev/icons](https://lucide.dev/icons).

## Assets (images, fonts)

Whiteboard pages run in a sandboxed iframe. Loading decorative assets from third-party hosts is **not recommended** — it adds network dependency and can break offline or in restricted environments.

| Not recommended                                                        | Prefer instead                                                                         |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Standalone icon CDNs (Font Awesome, Iconify, manual Lucide `<script>`) | Bootstrap `lucide` dep                                                                 |
| Inline `<svg>` icons (hand-written or pasted)                          | `data-lucide` via bootstrap                                                            |
| `<img src="https://…">` / hotlinked images                             | Runtime files via `/jarvis/file?path=workspace/...`; small `data:` URIs if unavoidable |
| Web fonts (`fonts.googleapis.com`, `unpkg.com` font CSS, etc.)         | System stack only — `theme.css` sets `system-ui, -apple-system, sans-serif` on `body`  |

**Other external `<script>` / `<link>` tags are allowed** when a page needs a library not covered by `data-jarvis-deps` (e.g. extra highlight.js language packs). Prefer registering common deps in bootstrap; add page-specific CDN tags only when necessary.

Manual init (optional):

```javascript
await jarvis.init({ deps: ["tailwind", "react", "babel", "zod"] });
```

## `window.jarvis` API

| Method                                          | Usage                                                                                  |
| ----------------------------------------------- | -------------------------------------------------------------------------------------- |
| `jarvis.init({ deps })`                         | Load deps; returns a Promise. Auto-runs when `data-jarvis-deps` is set.                |
| `jarvis.createIcons(options?)`                  | Replace `[data-lucide]` in **static HTML** with SVG. Requires `lucide` dep.            |
| `jarvis.refreshIcons()`                         | `createIcons()` + re-run on next frame (static HTML only).                             |
| `jarvis.LucideIcon`                             | React component: `<LucideIcon name="…" className="…" />`. Requires `react` + `lucide`. |
| `jarvis.navigate(path)`                         | Navigate whiteboard to another runtime HTML (via parent `postMessage`). Iframe only.   |
| `jarvis.read(path, options?)`                   | Read file. `as: "json"`, `default` on 404.                                             |
| `jarvis.writeTextFile(path, content, options?)` | Write file. Default `debounce: 600`. `debounce: false` for immediate.                  |
| `jarvis.flushWrite(path)`                       | Flush pending debounced write.                                                         |

## Minimal example — static HTML (no React)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Metrics Overview</title>
    <script
      src="/jarvis/file?path=.jarvis/whiteboard/bootstrap.js"
      data-jarvis-deps="tailwind,lucide"
    ></script>
  </head>
  <body class="min-h-screen bg-background text-foreground antialiased">
    <main class="mx-auto w-full max-w-md p-4">
      <h1 class="flex items-center gap-2 text-lg font-semibold">
        <i data-lucide="sparkles" class="size-5 text-primary"></i>
        Hello
      </h1>
      <p class="text-sm text-muted-foreground">Static whiteboard page</p>
    </main>
  </body>
</html>
```

## Minimal example — React + JSX

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Metrics Overview</title>
    <script
      src="/jarvis/file?path=.jarvis/whiteboard/bootstrap.js"
      data-jarvis-deps="tailwind,react,babel,lucide"
    ></script>
  </head>
  <body class="min-h-screen bg-background text-foreground antialiased">
    <div id="root" class="mx-auto w-full max-w-md p-4"></div>
    <script type="text/babel">
      const LucideIcon = jarvis.LucideIcon;

      function App() {
        return (
          <div className="space-y-4">
            <h1 className="flex items-center gap-2 text-lg font-semibold">
              <LucideIcon
                name="calendar-days"
                className="size-5 text-primary"
              />
              This week at a glance
            </h1>
            <p className="text-sm text-muted-foreground">Fixed sample data</p>
          </div>
        );
      }
      ReactDOM.createRoot(document.getElementById("root")).render(<App />);
    </script>
  </body>
</html>
```

## Layout rules

- Center column `max-w-md` / `max-w-lg` — panel is ~480px wide
- Cards: `rounded-lg border border-border bg-card`
- Text hierarchy: `text-foreground` / `text-muted-foreground`
- Copy in **English** unless user asks otherwise

## File locations

| Path                              | Use                                              |
| --------------------------------- | ------------------------------------------------ |
| `.jarvis/whiteboard/bootstrap.js` | Bootstrap loader + theme sync + file API         |
| `.jarvis/whiteboard/theme.css`    | Theme tokens + scrollbars (loaded automatically) |
| `home.html`                       | Default landing                                  |
| `workspace/*.html`                | Task pages                                       |
| `workspace/<slug>/data/*.json`    | Data files for persist examples                  |

## References (read when needed)

| Doc                                      | When                                                 |
| ---------------------------------------- | ---------------------------------------------------- |
| `references/todo-list-persist.md`        | Todo with file API, Zod, form submit, auto-save      |
| `references/clipboard-intake-form.md`    | Temp form → copy JSON to clipboard for chat          |
| `references/chart-and-code-highlight.md` | ECharts chart + highlight.js code block (fixed data) |

## After saving

Always **`navigate_whiteboard`** so the user sees the page.

## Avoid

- Manual icon CDNs, hand-written inline `<svg>` icons, hotlinked images, web fonts — not recommended; use bootstrap `lucide` for icons
- Light gray/white page backgrounds or raw color literals (`#fff`, `bg-zinc-900`, etc.)
- Duplicated CDN `<script>` / theme CSS when bootstrap covers them
- Raw `fetch("/jarvis/file…")` when `window.jarvis` is available
- Multi-file SPAs needing a bundler
- `100vw` full-screen layouts
- Navigating before the file exists
