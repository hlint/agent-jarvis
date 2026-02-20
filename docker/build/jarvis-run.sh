#!/usr/bin/with-contenv bash

# Change to the application directory
cd /jarvis

# Copy the default desktop icons to the config directory
cp -r /usr/local/share/default-desktop/* /config/Desktop/

# Make sure the user has the correct permissions
chown -R abc:abc /jarvis /usr/local/share /config

# Start the program with the abc user
echo "--- Starting Jarvis with user abc ---"
echo "Current Directory: ${PWD}"
echo "Current PUID: ${PUID}"
echo "Current PGID: ${PGID}"
echo "--- Starting Jarvis ---"
exec s6-setuidgid abc bun index.js