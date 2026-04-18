#!/usr/bin/with-contenv bash
set -euo pipefail

export SEARXNG_SETTINGS_PATH="${SEARXNG_SETTINGS_PATH:-/etc/searxng/settings.yml}"
export SEARXNG_LIMITER="${SEARXNG_LIMITER:-false}"

export GRANIAN_PROCESS_NAME="${GRANIAN_PROCESS_NAME:-searxng}"
export GRANIAN_INTERFACE="${GRANIAN_INTERFACE:-wsgi}"
export GRANIAN_HOST="${GRANIAN_HOST:-0.0.0.0}"
export GRANIAN_PORT="${SEARXNG_PORT:-4203}"
export GRANIAN_WEBSOCKETS="${GRANIAN_WEBSOCKETS:-false}"
# Lower default backpressure than Granian’s derived default to avoid huge “512 threads” warnings on small hosts.
export GRANIAN_BACKPRESSURE="${GRANIAN_BACKPRESSURE:-64}"

if [ -z "${SEARXNG_SECRET:-}" ]; then
	SEARXNG_SECRET="$(openssl rand -hex 32)"
	export SEARXNG_SECRET
fi

cd /usr/local/searxng/searxng-src
# WSGI shim: after SearXNG init, raise ``searx.engines`` log level (default critical)
# so engine ERROR/traceback spam stays off stderr. Override: SEARXNG_ENGINE_LOG_LEVEL=warning
exec s6-setuidgid searxng /usr/local/searxng/searx-pyenv/bin/granian jarvis_searx_wsgi:app
