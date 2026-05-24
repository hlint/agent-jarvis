#!/usr/bin/with-contenv bash

# Change to the application directory
cd /agent-jarvis

# Copy the default desktop icons to the config directory
cp -r /usr/local/share/default-desktop/* /config/Desktop/

# Copy the default Agent Browser configuration to the config directory
if [ ! -f /config/.agent-browser/config.json ]; then
  mkdir -p /config/.agent-browser
  cp -r /usr/local/share/default-agent-browser.config.json /config/.agent-browser/config.json
fi

# Make sure the user has the correct permissions
chown -R abc:abc /agent-jarvis /usr/local/share /config

# Start the program with the abc user
echo "--- Starting Jarvis with user abc ---"
echo "Current Directory: ${PWD}"
echo "Current PUID: ${PUID}"
echo "Current PGID: ${PGID}"
echo "--- Starting Jarvis ---"

# Start Jarvis Chat UI
s6-setuidgid abc sh -c '
  sleep 2
	rm -f /config/.config/chromium/Singleton*
  chromium --app=http://localhost:4202/ > /dev/null 2>&1 &
'
exec s6-setuidgid abc bun jarvis.js