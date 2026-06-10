#!/usr/bin/with-contenv bash
set -euo pipefail

export HEADROOM_HOST="${HEADROOM_HOST:-0.0.0.0}"
export HEADROOM_PORT="${HEADROOM_PORT:-8787}"
export HEADROOM_LOG_LEVEL="${HEADROOM_LOG_LEVEL:-INFO}"

exec s6-setuidgid headroom /usr/local/headroom/headroom-pyenv/bin/headroom proxy \
	--host "${HEADROOM_HOST}" \
	--port "${HEADROOM_PORT}"
