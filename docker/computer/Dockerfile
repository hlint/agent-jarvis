# COMPUTER
# Pin linuxserver/webtop ubuntu-xfce (2026-06-02, ls280). Bump after testing upstream.
FROM lscr.io/linuxserver/webtop:ubuntu-xfce-version-be8fdec1 AS computer

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

# Copy SearXNG settings and WSGI script
COPY ./searxng/settings.yml /etc/searxng/settings.yml
COPY ./searxng/jarvis_searx_wsgi.py /usr/local/searxng/searxng-src/jarvis_searx_wsgi.py
RUN chown searxng:searxng /etc/searxng/settings.yml \
    && chown searxng:searxng /usr/local/searxng/searxng-src/jarvis_searx_wsgi.py

# Headroom AI proxy (proxy+code). Keep HEADROOM_VERSION in sync with apps/server/package.json.
ENV HEADROOM_VERSION=0.22.4

# Webtop ships Python 3.14; headroom-ai wheels currently support through 3.13.
RUN apt-get update && apt-get install -y --no-install-recommends software-properties-common \
    && add-apt-repository -y ppa:deadsnakes/ppa \
    && apt-get update && apt-get install -y --no-install-recommends python3.12 python3.12-venv \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 978 headroom \
    && useradd --system --uid 978 --gid headroom --home-dir /usr/local/headroom --shell /usr/sbin/nologin headroom \
    && mkdir -p /usr/local/headroom \
    && chown -R headroom:headroom /usr/local/headroom

USER headroom
WORKDIR /usr/local/headroom

RUN HOME=/usr/local/headroom python3.12 -m venv headroom-pyenv \
    && HOME=/usr/local/headroom . headroom-pyenv/bin/activate \
    && pip install -U pip \
    && pip install --only-binary=:all: "headroom-ai[proxy,code]==${HEADROOM_VERSION}"

USER root
