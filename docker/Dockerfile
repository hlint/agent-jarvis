# BUILDER
FROM --platform=$BUILDPLATFORM oven/bun:latest AS builder
WORKDIR /app
COPY . .
RUN bun ci && bun run compile

# ------------------------------------------

# COMPUTER
FROM lscr.io/linuxserver/webtop:ubuntu-xfce AS computer

# Environment Variables
ENV PUID=1000
ENV PGID=1000
ENV NPM_CONFIG_PREFIX=/usr/local/share/.npm-global
ENV BUN_INSTALL_GLOBAL="/usr/local/share/.bun"
ENV PLAYWRIGHT_BROWSERS_PATH=/usr/local/share/playwright
ENV PATH=$PATH:$NPM_CONFIG_PREFIX/bin:$BUN_INSTALL_GLOBAL/bin

# Install base tools, Node.js, and build deps for SearXNG (venv + native wheels)
RUN apt-get update && apt-get install -y unzip tmux curl wget gpg\
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
        python3-dev python3-babel python3-venv python-is-python3 \
        git build-essential \
        libxslt-dev zlib1g-dev libffi-dev libssl-dev libxml2-dev \
        pkg-config \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Playwright Dependencies
RUN npx -y playwright install-deps

# Install Bun
ENV BUN_INSTALL="/usr/local"
RUN curl -fsSL https://bun.sh/install | bash

# Pre-install tools required by the application.
# Do not run `agent-browser install` here: Webtop already includes a browser.
RUN mkdir -p $NPM_CONFIG_PREFIX $BUN_INSTALL_GLOBAL $PLAYWRIGHT_BROWSERS_PATH && \
    npm install -g agent-browser

# Install VSCode
RUN wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o packages.microsoft.gpg \
    && install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg \
    && echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list
RUN apt-get update && apt-get install -y code
RUN sed -i 's|Exec=/usr/share/code/code|Exec=/usr/share/code/code --no-sandbox --user-data-dir=/config/.vscode-root|g' /usr/share/applications/code.desktop
RUN echo '#!/bin/bash\n/usr/bin/code --no-sandbox --user-data-dir=/config/.vscode-root "$@"' > /usr/local/bin/code-proxy && chmod +x /usr/local/bin/code-proxy && ln -sf /usr/local/bin/code-proxy /usr/local/bin/code

# SearXNG (Granian): fixed Git revision (~2026.4.17); bump after testing upstream changes.
ENV SEARXNG_GIT_REVISION=e8299a4c37627c6271ed83227c27cf98021c03f6

RUN groupadd --system --gid 977 searxng \
    && useradd --system --uid 977 --gid searxng --home-dir /usr/local/searxng --shell /bin/bash searxng \
    && mkdir -p /usr/local/searxng /etc/searxng /var/cache/searxng \
    && chown -R searxng:searxng /usr/local/searxng /etc/searxng /var/cache/searxng

USER searxng
WORKDIR /usr/local/searxng

RUN set -eux \
    && git init searxng-src \
    && cd searxng-src \
    && git remote add origin https://github.com/searxng/searxng.git \
    && git fetch --depth 1 origin "${SEARXNG_GIT_REVISION}" \
    && git checkout "${SEARXNG_GIT_REVISION}"

RUN HOME=/usr/local/searxng python3 -m venv /usr/local/searxng/searx-pyenv \
    && HOME=/usr/local/searxng . /usr/local/searxng/searx-pyenv/bin/activate \
    && pip install -U pip setuptools wheel \
    && pip install -U pyyaml msgspec typing-extensions pybind11 \
    && cd /usr/local/searxng/searxng-src \
    && pip install --use-pep517 --no-build-isolation -e . \
    && pip install 'granian[pname]'

USER root

COPY ./docker/assets/searxng/settings.yml /etc/searxng/settings.yml
COPY ./docker/assets/searxng/jarvis_searx_wsgi.py /usr/local/searxng/searxng-src/jarvis_searx_wsgi.py
RUN chown searxng:searxng /etc/searxng/settings.yml \
    && chown searxng:searxng /usr/local/searxng/searxng-src/jarvis_searx_wsgi.py

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