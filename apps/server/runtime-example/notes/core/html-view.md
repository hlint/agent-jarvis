---
description: Prefer html-view for user-facing answers; build interactive, layered pages (tabs, panels)—not markdown walls
autoLoad: true
---

## What It Is

A **single, self-contained HTML document** submitted via `html-view` and shown to the user in an **iframe** in chat.

- One file: no build step, no backend, no sibling assets (HTTPS URLs or inline SVG only).
- Portable: opens standalone or in any iframe HTML preview client.

**Tool args:** `title` (short label), `content` (full HTML from `<!DOCTYPE html>`). Max ~**512KB** UTF-8.

---

## When to use

**Default for substantive replies** — anything to read, compare, explore, or act on (sections, tables, metrics, charts, reports, demos, guides). Build **small apps** (tabs, accordions, filters, cards)—not a long vertical markdown scroll.

| Channel | When |
| ------- | ---- |
| **`html-view`** | Default; page carries the substance |
| **`output`** | One-liner or brief pointer (“see page above”); optional 1–2 sentences alongside a page |

Do not duplicate the same long body in chat markdown.

**Skip `html-view` for:** existing files (`attachment`), scraped pages (`web-extract`), or APIs that need `window.parent`, cookies, or `localStorage`.

**Layout:** prefer tabs / master–detail / toolbar+canvas over dumping every `<h2>` block on one page. Use Lucide, KPI cards, and progressive disclosure (summary first, detail on interaction). Scrollable content below tabs or a side menu: **`sticky top-0 z-10`** on that bar (opaque `bg-neutral-950/95` + `backdrop-blur-sm`) so navigation stays pinned while the panel scrolls.

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
| Code highlighting      | highlight.js 11.11.1 on cdnjs (CSS + `highlight.min.js`) |

- Start from the **starter template** below (includes default `text/tailwindcss` styles). Extend that block only when needed—do not duplicate body/scrollbar rules on elements.
- Init ECharts / D3 / highlight.js after scripts load (`DOMContentLoaded` or trailing inline script). Match chart and code-block colors to the dark UI.

**Lucide icons:** place `<i data-lucide="icon-name" class="…"></i>` in markup, load the script, then call `lucide.createIcons()`:

```html
<i data-lucide="menu" class="size-5"></i>
<script src="https://unpkg.com/lucide@latest"></script>
<script>
  lucide.createIcons();
</script>
```

Load Lucide after the icon elements (typically end of `<body>`). Re-run `createIcons()` if Alpine or other code injects new `data-lucide` nodes.

**Highlight.js:** use `language-*` on `<code>` inside `<pre>`, theme CSS in `<head>`, script at end of `<body>`, then `hljs.highlightAll()` (re-run after Alpine injects new blocks):

```html
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/dark.min.css"
/>
<pre><code class="language-html">&lt;div&gt;…&lt;/div&gt;</code></pre>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js"></script>
<script>
  hljs.highlightAll();
</script>
```

**Other libraries:** use **web search** for official docs and an **HTTPS** CDN (jsDelivr, unpkg, vendor CDN). UMD + `<script src="…">` is enough—no bundler. Keep script count and size small.

**Fonts:** use the template’s **system font stack** only—**no** `<link>` / `@font-face` / CDN web fonts by default (including Google Fonts and jsDelivr Fontsource). Only add external fonts if the user explicitly asks for a specific typeface.

### Look & feel

- Dark UI and system typography come from the template’s `text/tailwindcss` block; scrollbar styling lives in a separate plain `<style>` (Tailwind does not emit `::-webkit-scrollbar`; iframe preview also needs `color-scheme: dark` on `html`).
- For surfaces: cards `bg-neutral-900`, borders `border-neutral-800`, muted text `text-neutral-400`.
- Tab bars, toolbars, side nav: `sticky top-0 z-10` (or `sticky top-0` in a horizontal scroll column)—avoid losing menu context on long pages.

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

Tabbed layout baseline—extend panels instead of stacking everything in one scroll. Add ECharts or D3 `<script>` tags in `<head>` when needed. Lucide loads at the end of `<body>`.

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
      [x-cloak] {
        display: none !important;
      }
    </style>
  </head>
  <body class="min-h-screen font-sans antialiased">
    <main class="mx-auto max-w-4xl p-6" x-data="{ tab: 'overview' }">
      <header class="mb-6">
        <h1 class="text-2xl font-semibold tracking-tight">Title</h1>
        <p class="mt-2 max-w-2xl text-sm text-neutral-400">
          One-line summary; KPIs or actions live in the active panel—not a long preamble.
        </p>
      </header>

      <nav
        class="sticky top-0 z-10 flex flex-wrap gap-1 rounded-xl border border-neutral-800 bg-neutral-950/95 p-1 backdrop-blur-sm"
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition"
          :class="tab === 'overview' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'"
          @click="tab = 'overview'"
        >
          <i data-lucide="layout-dashboard" class="size-4"></i>
          Overview
        </button>
        <button
          type="button"
          role="tab"
          class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition"
          :class="tab === 'details' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'"
          @click="tab = 'details'"
        >
          <i data-lucide="list-tree" class="size-4"></i>
          Details
        </button>
        <button
          type="button"
          role="tab"
          class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition"
          :class="tab === 'data' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'"
          @click="tab = 'data'"
        >
          <i data-lucide="table" class="size-4"></i>
          Data
        </button>
      </nav>

      <section
        x-show="tab === 'overview'"
        x-cloak
        class="mt-4 grid gap-4 sm:grid-cols-3"
        role="tabpanel"
      >
        <article class="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4">
          <p class="text-xs uppercase tracking-wide text-neutral-500">Metric</p>
          <p class="mt-1 text-2xl font-semibold tabular-nums">128</p>
        </article>
        <article class="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 sm:col-span-2">
          <p class="text-sm text-neutral-300">Key takeaway for this tab.</p>
        </article>
      </section>

      <section
        x-show="tab === 'details'"
        x-cloak
        class="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/80 p-4"
        role="tabpanel"
      >
        <p class="text-sm text-neutral-300">
          Structured detail—lists, steps, or accordions—not a wall of plain paragraphs.
        </p>
      </section>

      <section
        x-show="tab === 'data'"
        x-cloak
        class="mt-4 overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/80 p-4"
        role="tabpanel"
      >
        <table class="w-full text-left text-sm">
          <thead class="text-neutral-500">
            <tr>
              <th class="pb-2 font-medium">Name</th>
              <th class="pb-2 font-medium">Value</th>
            </tr>
          </thead>
          <tbody class="text-neutral-200">
            <tr class="border-t border-neutral-800">
              <td class="py-2">Example</td>
              <td class="py-2 tabular-nums">42</td>
            </tr>
          </tbody>
        </table>
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

- [ ] Full document; starter template; layered UI; sticky tab/menu bar when content scrolls
- [ ] CDN scripts match task; contrast OK; no parent / cookie / storage APIs; reasonable size
- [ ] Substance here—not duplicated as long `output` markdown
