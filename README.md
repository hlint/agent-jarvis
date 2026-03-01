# Agent Jarvis

An autonomous AI assistant that learns, remembers, and acts for you—with a persistent workspace and containerized deployment.

![preview](./docs/assets/preview.png)

## What It Does

Jarvis is self-learning and proactive: reflects after tasks, logs insights, and anticipates needs. Diaries, notes, skills, and cron tasks live in a persistent workspace, so context carries over. It runs web search, file ops, shell commands, and browser automation end-to-end. Chat via web UI or Telegram.

## Differs from other Claws

- **Single session** — One linear conversation, one shared context. No lanes or per-sender routing. Closer to talking to one person: coherent, predictable, human-like.

- **Lightweight** — Fast startup, minimal config. Markdown-based storage only. Pure TypeScript/Bun stack, no external services required; runs fully local.

- **Desktop Docker** — Full Ubuntu XFCE desktop inside the container (Webtop). Access a real browser and terminal in your browser; the agent runs in isolation with everything preinstalled.

## Deploy

**Prerequisites:** [Bun](https://bun.sh) 1.3+

1. Copy `config.example.ts` to `config.ts` and add your AI provider API key.
2. For Docker: copy `config.ts` to `docker/volumes/config.ts` (or adjust the compose volume path).
3. Build and run:

```bash
bun compile
cd docker && docker compose up -d
```

- **4201** — Desktop (Webtop, browser-based)
- **4202** — Chat UI

All execution stays inside the container. Volumes persist runtime data, config, and desktop state.

**Local development:** `bun ci` → `bun dev`
