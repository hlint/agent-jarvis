---
description: Prefer html-view for user-facing answers; build interactive, layered pages—not markdown walls
autoLoad: true
---

## What It Is

A **single, self-contained HTML document** submitted via `html-view` and shown to the user in an **iframe** in chat.

- One file: no build step, no backend, no sibling assets (HTTPS URLs or inline SVG only).
- Portable: opens standalone or in any iframe HTML preview client.

**Tool args:** `title` (short label), `content` (full HTML from `<!DOCTYPE html>`). Max ~**512KB** UTF-8.

---

## When to use

**Default for substantive replies** — anything to read, compare, explore, or act on (sections, tables, metrics, charts, reports, demos, guides). Build **small apps** (filters, cards, accordions, split views)—not a long vertical markdown scroll.

| Channel         | When                                                                                   |
| --------------- | -------------------------------------------------------------------------------------- |
| **`html-view`** | Default; page carries the substance                                                    |
| **`output`**    | One-liner or brief pointer (“see page above”); optional 1–2 sentences alongside a page |

Do not duplicate the same long body in chat markdown.

**Skip `html-view` for:** existing files (`attachment`), scraped pages (`web-extract`), or APIs that need `window.parent`, cookies, or `localStorage`.

**Layout:** pick a structure that fits the content—single scroll, sections with headings, sidebar + detail, accordion, segmented controls, or tabs only when several **peer** views are equal weight. Avoid dumping every topic as a sequential `<h2>` wall. Use progressive disclosure (summary first, detail on interaction). For icons, use **emoji** inline; do not load icon font or SVG icon libraries.

---

## Rules

### Document

- Full HTML5: `<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`.
- `<head>`: `charset`, `viewport`; `lang` matches the user (e.g. `en`, `zh-CN`).
- **All visible UI inside one `<main>`** (required). The chat iframe auto-height tracks `<main>` only; helper scripts may sit outside `<main>` in `<body>`.
- **No viewport-height shells on `html` / `body`:** do not use `min-h-screen`, `h-screen`, `min-h-full`, or `h-full` on `html`, `body`, or wrappers outside `<main>`—they break iframe sizing. Put layout min-heights on inner panels inside `<main>` if needed.

### Stack (load only what you need)

| Purpose                | Default CDN                                                |
| ---------------------- | ---------------------------------------------------------- |
| Styling                | `https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4`      |
| UI state / interaction | `https://unpkg.com/alpinejs` (`defer`)                     |
| Charts                 | `https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js` |
| Custom viz / SVG       | `https://d3js.org/d3.v7.min.js`                            |
| Code highlighting      | highlight.js 11.11.1 on cdnjs (CSS + `highlight.min.js`)   |

- Start from the **starter template** below (includes default `text/tailwindcss` styles). Extend that block only when needed—do not duplicate body rules on elements.
- Init ECharts / D3 / highlight.js after scripts load (`DOMContentLoaded` or trailing inline script). Match chart and code-block colors to the dark UI.

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

**Fonts:** do not declare or change fonts—keep the browser/system default.

### Look & feel

- Dark UI comes from the template’s `text/tailwindcss` block.
- Iframe preview injects a resize script that reads **only `<main>`** height; keep `html`/`body` shrink-wrapped (no `min-h-screen`).
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

Baseline single-page layout—swap in tabs, sidebar, or accordions when the task calls for it. Add ECharts or D3 `<script>` tags in `<head>` when needed.

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
      body {
        @apply bg-neutral-950 text-neutral-100;
      }
    </style>
    <style>
      html {
        color-scheme: dark;
      }
      [x-cloak] {
        display: none !important;
      }
    </style>
  </head>
  <body class="antialiased">
    <main class="mx-auto max-w-4xl space-y-6 p-6">
      <header>
        <h1 class="text-2xl font-semibold tracking-tight">Title</h1>
        <p class="mt-2 max-w-2xl text-sm text-neutral-400">
          One-line summary; keep the lead short—detail lives in sections below.
        </p>
      </header>

      <section class="grid gap-4 sm:grid-cols-3">
        <article
          class="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4"
        >
          <p class="text-xs uppercase tracking-wide text-neutral-500">
            📈 Metric
          </p>
          <p class="mt-1 text-2xl font-semibold tabular-nums">128</p>
        </article>
        <article
          class="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 sm:col-span-2"
        >
          <p class="text-sm text-neutral-300">Key takeaway or call to action.</p>
        </article>
      </section>

      <section class="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4">
        <h2 class="text-sm font-medium text-neutral-200">Details</h2>
        <p class="mt-2 text-sm text-neutral-300">
          Structured content—lists, steps, tables, or
          <code class="rounded bg-neutral-800 px-1">inline code</code>—not a
          wall of plain paragraphs.
        </p>
      </section>

      <details
        class="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4"
      >
        <summary class="cursor-pointer text-sm font-medium text-neutral-200">
          🔽 Optional deep dive
        </summary>
        <p class="mt-3 text-sm text-neutral-400">
          Extra material hidden until expanded—useful when the page should stay
          scannable.
        </p>
      </details>
    </main>
  </body>
</html>
```

---

## Before submit

- [ ] Full document; single `<main>` for UI; starter template or equivalent structure; layout matches the task (not tabs by default); no `min-h-screen` on `html`/`body`
- [ ] CDN scripts match task; contrast OK; no icon libraries; no parent / cookie / storage APIs; reasonable size
- [ ] Substance here—not duplicated as long `output` markdown
