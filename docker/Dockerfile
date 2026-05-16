# BUILDER
FROM --platform=$BUILDPLATFORM oven/bun:latest AS builder
WORKDIR /app
COPY . .
RUN bun ci && bun run compile

# ------------------------------------------

# COMPUTER
FROM hlint/agent-jarvis-computer:1.0.0 AS computer

# ------------------------------------------

# RUNNER
FROM computer AS runner

# Environment Variables
ENV CUSTOM_HTTPS_PORT=4200
ENV CUSTOM_PORT=4201
ENV JARVIS_SERVER_PORT=4202
ENV SEARXNG_PORT=4203
ENV TITLE="Jarvis Computer"

# Desktop Icon
RUN mkdir -p /usr/local/share/default-desktop
COPY ./docker/assets/desktop /usr/local/share/default-desktop

# Webtop Icon
COPY ./apps/frontend/public/favicon.png /usr/share/selkies/www/icon.png

# LinuxServer base uses s6-overlay: long-running services live under /etc/services.d/<name>/run (started at boot).
# Agent Jarvis (Chat UI on JARVIS_SERVER_PORT).
RUN mkdir -p /etc/services.d/agent-jarvis
COPY ./docker/assets/agent-jarvis-run.sh /etc/services.d/agent-jarvis/run
RUN chmod +x /etc/services.d/agent-jarvis/run

# SearXNG (Granian WSGI on SEARXNG_PORT).
RUN mkdir -p /etc/services.d/searxng
COPY ./docker/assets/searxng/searxng-run.sh /etc/services.d/searxng/run
RUN chmod +x /etc/services.d/searxng/run

# Copy the built application
COPY --from=builder /app/output/dist /agent-jarvis