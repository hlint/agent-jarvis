# Docker Deployment

Two images are available:

| Variant  | Image                            | Use case                                                                                    |
| -------- | -------------------------------- | ------------------------------------------------------------------------------------------- |
| **Full** | `hlint/agent-jarvis:latest`      | Ubuntu XFCE desktop (Webtop), Chromium, VS Code, browser automation. Higher resource usage. |
| **Lite** | `hlint/agent-jarvis-lite:latest` | Chat UI only. No desktop. Lighter footprint, lower requirements.                            |

## Prerequisites

- [Docker](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/install/)

---

## Full (Desktop)

Includes a full desktop environment for browser automation and visual tools.

### Quick setup

1. Create a deploy directory. Copy `docker-compose.example.yml` as `docker-compose.yml`.
2. Create `volumes/`, copy your `config.json` to `volumes/config.json`, add API keys. See [Configuration](config.md).
3. Set `PUID` and `PGID` to your user/group IDs (`id`). Uncomment port `4202` for Chat UI.
4. Run `docker compose up -d`.
5. Access: Chat UI at `http://localhost:4202`, desktop at `https://localhost:4200`.

### Ports

| Port | Service   | Description                       |
| ---- | --------- | --------------------------------- |
| 4200 | VNC HTTPS | Webtop desktop (self-signed cert) |
| 4201 | VNC       | Alternative VNC endpoint          |
| 4202 | Chat UI   | Web chat interface                |

### Volumes

| Host                       | Container                   | Purpose                                          |
| -------------------------- | --------------------------- | ------------------------------------------------ |
| `./volumes/jarvis-runtime` | `/agent-jarvis/runtime`     | Workspace: diaries, notes, skills, chat state    |
| `./volumes/webtop-config`  | `/config`                   | Desktop: browser profile, VS Code, desktop files |
| `./volumes/config.json`    | `/agent-jarvis/config.json` | Agent config (required)                          |

### Environment

| Variable   | Default   | Description                                                                                                                                                 |
| ---------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TZ`       | `Etc/UTC` | Timezone ([tz database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List))                                                                 |
| `PUID`     | `1000`    | User ID (`id -u`)                                                                                                                                           |
| `PGID`     | `1000`    | Group ID (`id -g`)                                                                                                                                          |
| `PASSWORD` | _(unset)_ | Enables HTTP Basic Auth for the Jarvis web server (username: `abc`). Also protects Webtop. Do not use if behind a reverse proxy (e.g. Nginx Proxy Manager). |

---

## Lite (Chat only)

Minimal image: Chat UI only. No desktop, no browser automation.

### Quick setup

1. Create a deploy directory. Copy `docker-compose-lite.example.yml` as `docker-compose.yml`.
2. Create `volumes/`, copy your `config.json` to `volumes/config.json`, add API keys. See [Configuration](config.md).
3. Run `docker compose up -d`.
4. Access Chat UI at `http://localhost:4202`.

### Ports

| Port | Service |
| ---- | ------- |
| 4202 | Chat UI |

### Volumes

| Host                       | Container                   | Purpose                 |
| -------------------------- | --------------------------- | ----------------------- |
| `./volumes/jarvis-runtime` | `/agent-jarvis/runtime`     | Workspace               |
| `./volumes/config.json`    | `/agent-jarvis/config.json` | Agent config (required) |

### Environment

| Variable   | Default   | Description                                                                                                |
| ---------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| `TZ`       | `Etc/UTC` | Timezone                                                                                                   |
| `PASSWORD` | _(unset)_ | Enables HTTP Basic Auth for the Jarvis web server (username: `abc`). Do not use if behind a reverse proxy. |

---

## Building from source

**Full image:**

```bash
docker build -t agent-jarvis:latest -f docker/Dockerfile .
```

**Lite image:**

```bash
docker build -t agent-jarvis-lite:latest -f docker/Dockerfile-lite .
```

Then use the corresponding `docker-compose.example.yml` or `docker-compose-lite.example.yml` as `docker-compose.yml` (the image names match).

---

## Directory structure

**Full:**

```
deploy-dir/
├── docker-compose.yml
└── volumes/
    ├── config.json
    ├── jarvis-runtime/
    └── webtop-config/
```

**Lite:**

```
deploy-dir/
├── docker-compose.yml
└── volumes/
    ├── config.json
    └── jarvis-runtime/
```

---

## Troubleshooting

### Container exits immediately

- Ensure `volumes/config.json` exists and has at least one provider with `CHAT` duty.
- Check logs: `docker compose logs agent-jarvis`.

### Permission errors (Full only)

- Set `PUID` and `PGID` to match your host user/group.
- Ensure host user can write to `./volumes/`.

### Cannot access Chat UI

- Confirm port `4202` is exposed in `docker-compose.yml`.
- Ensure no other service is using port 4202.

### Desktop / VNC issues (Full only)

- For `https://localhost:4200`, accept the self-signed certificate in your browser.
- Ensure ports 4200 or 4201 are exposed.

### Config changes not applied

- Config is hot-reloaded. Restart if needed: `docker compose restart agent-jarvis`.
