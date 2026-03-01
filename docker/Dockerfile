FROM lscr.io/linuxserver/webtop:ubuntu-xfce

# Environment Variables
ENV CUSTOM_PORT=4201
ENV JARVIS_SERVER_PORT=4202
ENV PUID=1000
ENV PGID=1000
ENV NPM_CONFIG_PREFIX=/usr/local/share/.npm-global
ENV BUN_INSTALL_GLOBAL="/usr/local/share/.bun"
ENV PLAYWRIGHT_BROWSERS_PATH=/usr/local/share/playwright
ENV PATH=$PATH:$NPM_CONFIG_PREFIX/bin:$BUN_INSTALL_GLOBAL/bin

# Install base tools and Node.js
RUN apt-get update && apt-get install -y unzip tmux curl \
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

# Desktop Icon
RUN mkdir -p /usr/local/share/default-desktop
COPY ./docker/build/desktop /usr/local/share/default-desktop

# Webtop Title
ENV TITLE="Jarvis Computer"

# Webtop Icon
COPY ./output/dist/html/favicon.png /usr/share/selkies/www/icon.png

# S6 service startup configuration
RUN mkdir -p /etc/services.d/jarvis
COPY ./docker/build/jarvis-run.sh /etc/services.d/jarvis/run
RUN chmod +x /etc/services.d/jarvis/run

# Expose ports
EXPOSE 4201 4202

# Application
RUN mkdir -p /jarvis
COPY ./output/dist /jarvis