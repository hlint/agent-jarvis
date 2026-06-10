# BUILDER
FROM --platform=$BUILDPLATFORM oven/bun:latest AS builder
WORKDIR /app
COPY . .
RUN bun ci && bun run compile

# ------------------------------------------

# COMPUTER
FROM hlint/agent-jarvis-computer:1.1.0 AS computer

# ------------------------------------------

# RUNNER
FROM computer AS runner

# Environment Variables
ENV JARVIS_WITH_COMPUTER=true
ENV CUSTOM_HTTPS_PORT=4200
ENV CUSTOM_PORT=4201
ENV JARVIS_SERVER_PORT=4202
ENV SEARXNG_PORT=4203
ENV HEADROOM_PORT=8787
ENV JARVIS_HEADROOM_PROXY_URL=http://localhost:8787
ENV TITLE="Jarvis Computer"

# Desktop Icon
COPY ./docker/jarvis/assets/desktop /usr/local/share/default-desktop

# Default Agent Browser configuration
COPY ./docker/jarvis/assets/browser/agent-browser.json /usr/local/share/default-agent-browser.config.json

# Webtop Icon
COPY ./apps/frontend/public/favicon.png /usr/share/selkies/www/icon.png

# LinuxServer base uses s6-overlay: long-running services live under /etc/services.d/<name>/run (started at boot).
# Agent Jarvis (Chat UI on JARVIS_SERVER_PORT).
COPY ./docker/jarvis/assets/agent-jarvis-run.sh /etc/services.d/agent-jarvis/run
RUN chmod +x /etc/services.d/agent-jarvis/run

# SearXNG (Granian WSGI on SEARXNG_PORT).
COPY ./docker/jarvis/assets/searxng/searxng-run.sh /etc/services.d/searxng/run
RUN chmod +x /etc/services.d/searxng/run

# Headroom proxy (compression API on HEADROOM_PORT).
COPY ./docker/jarvis/assets/headroom/headroom-run.sh /etc/services.d/headroom/run
RUN chmod +x /etc/services.d/headroom/run

# Copy the built application
COPY --from=builder /app/output/dist /agent-jarvis