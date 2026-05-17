---
description: Build full HTML pages for the html-view tool (iframe preview in chat)
autoLoad: true
---

## What It Is

A **single, self-contained HTML document** submitted via `html-view` and shown to the user in an **iframe** in chat.

- One file: no build step, no backend, no sibling assets (use HTTPS URLs or inline SVG for images/fonts).
- Portable: same source can be opened standalone or in any client that supports iframe HTML preview.
- Use **`output`** for short prose; use **`html-view`** for rich UI, dashboards, charts, or interactive demos.

**Tool args:** `title` (short label), `content` (full HTML starting with `<!DOCTYPE html>`). Max ~**512KB** UTF-8.

---

## When to Use `html-view`

**Use for:** interactive demos, dashboards, data viz, multi-column layouts, prototypes the user asked to “see as a page”.

**Do not use for:** one-line answers (`output`), existing files (`attachment`), scraping pages (`web-extract`), or logic that needs `window.parent`, cookies, or `localStorage`.

---

## Rules

### Document

- Full HTML5: `<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`.
- `<head>`: `charset`, `viewport`; `lang` matches the user (e.g. `en`, `zh-CN`).

### Stack (load only what you need)

| Purpose                | Default CDN                                                |
| ---------------------- | ---------------------------------------------------------- |
| Styling                | `https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4`      |
| UI state / interaction | `https://unpkg.com/alpinejs` (`defer`)                     |
| Icons                  | `https://unpkg.com/lucide@latest`                          |
| Charts                 | `https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js` |
| Custom viz / SVG       | `https://d3js.org/d3.v7.min.js`                            |

- Start from the **starter template** below (includes default `text/tailwindcss` styles). Extend that block only when needed—do not duplicate body/scrollbar rules on elements.
- Init ECharts / D3 after scripts load (`DOMContentLoaded` or trailing inline script). Match chart colors to the dark UI.

**Lucide icons:** place `<i data-lucide="icon-name" class="…"></i>` in markup, load the script, then call `lucide.createIcons()`:

```html
<i data-lucide="menu" class="size-5"></i>
<script src="https://unpkg.com/lucide@latest"></script>
<script>
  lucide.createIcons();
</script>
```

Load Lucide after the icon elements (typically end of `<body>`). Re-run `createIcons()` if Alpine or other code injects new `data-lucide` nodes.

**Other libraries:** use **web search** for official docs and an **HTTPS** CDN (jsDelivr, unpkg, vendor CDN). UMD + `<script src="…">` is enough—no bundler. Keep script count and size small.

**Fonts:** use the template’s **system font stack** only—**no** `<link>` / `@font-face` / CDN web fonts by default (including Google Fonts and jsDelivr Fontsource). Only add external fonts if the user explicitly asks for a specific typeface.

### Look & feel

- Dark UI and system typography come from the template’s `text/tailwindcss` block; scrollbar styling lives in a separate plain `<style>` (Tailwind does not emit `::-webkit-scrollbar`; iframe preview also needs `color-scheme: dark` on `html`).
- For surfaces: cards `bg-neutral-900`, borders `border-neutral-800`, muted text `text-neutral-400`.

### Sandbox (required)

No escaping the iframe:

- `window.parent` / `window.top` / `parent.postMessage`
- `document.cookie`, `localStorage`, `sessionStorage`, `indexedDB`
- `top.location` or similar host navigation

Keep state in the **current window** (Alpine `x-data`, in-memory JS, DOM).

### Assets

- HTTPS only; no `file://` or workspace-relative paths.
- Images: HTTPS URLs or inline SVG; watch total size.

---

## Starter template

Add ECharts or D3 `<script>` tags in `<head>` when needed. Lucide loads at the end of `<body>`.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page title</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <script src="https://unpkg.com/alpinejs" defer></script>
    <style type="text/tailwindcss">
      @theme {
        --font-sans:
          ui-sans-serif, system-ui, "PingFang SC", "Hiragino Sans GB",
          "Microsoft YaHei", "Noto Sans SC", sans-serif;
      }

      body {
        @apply bg-neutral-950 text-neutral-100;
      }
    </style>
    <style>
      html {
        color-scheme: dark;
      }
      html,
      * {
        scrollbar-width: thin;
        scrollbar-color: oklch(1 0 0 / 20%) transparent;
      }
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: oklch(0.5 0 0 / 20%);
        border-radius: 999px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: oklch(1 0 0 / 35%);
      }
    </style>
  </head>
  <body class="min-h-screen font-sans antialiased">
    <main class="mx-auto max-w-3xl p-6" x-data="{ count: 0 }">
      <h1 class="text-2xl font-semibold">Title</h1>
      <p class="mt-2 text-sm text-neutral-400">Short description.</p>
      <section
        class="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/80 p-4"
      >
        <p class="text-lg font-mono" x-text="'Count: ' + count"></p>
        <div class="mt-4 flex gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-amber-500/90 px-4 py-2 text-sm font-medium text-neutral-950 cursor-pointer"
            @click="count++"
          >
            <i data-lucide="plus" class="size-4"></i>
            Add
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-neutral-700 px-4 py-2 text-sm cursor-pointer"
            @click="count = 0"
          >
            <i data-lucide="rotate-ccw" class="size-4"></i>
            Reset
          </button>
        </div>
      </section>
    </main>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script>
      lucide.createIcons();
    </script>
  </body>
</html>
```

---

## Before submit

- [ ] Full document; starts with `<!DOCTYPE html>`
- [ ] Starter template (Tailwind + default styles; no external font CDN)
- [ ] CDN scripts match the task (Alpine / Lucide / ECharts / D3 as needed)
- [ ] Readable contrast on cards and charts
- [ ] No parent / cookie / storage APIs
- [ ] Reasonable size (no huge base64 images)
