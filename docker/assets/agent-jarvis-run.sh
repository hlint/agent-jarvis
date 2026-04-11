#!/usr/bin/with-contenv bash

# Change to the application directory
cd /agent-jarvis

# Copy the default desktop icons to the config directory
cp -r /usr/local/share/default-desktop/* /config/Desktop/

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
  chromium --user-data-dir=/config/chromium-data/jarvis \
           --app=http://localhost:4202/ > /dev/null 2>&1 &
'
exec s6-setuidgid abc bun jarvis.js