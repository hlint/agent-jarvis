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

# Install base tools and Node.js
RUN apt-get update && apt-get install -y unzip tmux curl wget gpg\
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Playwright Dependencies
RUN npx -y playwright install-deps

# Install Bun
ENV BUN_INSTALL="/usr/local"
RUN curl -fsSL https://bun.sh/install | bash

# Pre-install tools and browsers required by the application
RUN mkdir -p $NPM_CONFIG_PREFIX $BUN_INSTALL_GLOBAL $PLAYWRIGHT_BROWSERS_PATH && \
    npm install -g agent-browser && agent-browser install

# Install VSCode
RUN wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o packages.microsoft.gpg \
    && install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg \
    && echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list
RUN apt-get update && apt-get install -y code
RUN sed -i 's|Exec=/usr/share/code/code|Exec=/usr/share/code/code --no-sandbox --user-data-dir=/config/.vscode-root|g' /usr/share/applications/code.desktop
RUN echo '#!/bin/bash\n/usr/bin/code --no-sandbox --user-data-dir=/config/.vscode-root "$@"' > /usr/local/bin/code-proxy && chmod +x /usr/local/bin/code-proxy && ln -sf /usr/local/bin/code-proxy /usr/local/bin/code

# ------------------------------------------

# RUNNER
FROM computer AS runner

# Environment Variables
ENV CUSTOM_HTTPS_PORT=4200
ENV CUSTOM_PORT=4201
ENV JARVIS_SERVER_PORT=4202
ENV TITLE="Jarvis Computer"

# Expose ports
EXPOSE 4201 4202

# Desktop Icon
RUN mkdir -p /usr/local/share/default-desktop
COPY ./docker/assets/desktop /usr/local/share/default-desktop

# Webtop Icon
COPY ./apps/frontend/public/favicon.png /usr/share/selkies/www/icon.png

# S6 service startup configuration
RUN mkdir -p /etc/services.d/agent-jarvis
COPY ./docker/assets/agent-jarvis-run.sh /etc/services.d/agent-jarvis/run
RUN chmod +x /etc/services.d/agent-jarvis/run

# Copy the built application
COPY --from=builder /app/output/dist /agent-jarvis