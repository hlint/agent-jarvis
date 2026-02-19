FROM lscr.io/linuxserver/webtop:ubuntu-xfce

# System Dependencies
RUN apt-get update && apt-get install -y unzip tmux\
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get update \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Bun (system-wide for all users)
ENV BUN_INSTALL="/usr/local"
RUN curl -fsSL https://bun.sh/install | bash

# Agent Browser
RUN npm install -g agent-browser && npx playwright install

# Jarvis App
COPY ./apps/server/dist /jarvis
# webtop port
ENV CUSTOM_PORT=4201
ENV JARVIS_SERVER_PORT=4202

# 创建 s6 服务目录
RUN mkdir -p /etc/services.d/jarvis
RUN printf '#!/usr/bin/with-contenv bash\ncd /jarvis\nexec bun index.js\n' \
    > /etc/services.d/jarvis/run && \
    chmod +x /etc/services.d/jarvis/run