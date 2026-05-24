"""WSGI entry for Granian: SearXNG webapp with optional quieter engine logging.

Upstream logs engine failures (e.g. HTTP 403) at ERROR with tracebacks on
``searx.engines.*``. There is no ``logging:`` block in settings.yml schema, so
we tune loggers after ``searx`` has finished ``init_settings()`` / basicConfig.

JSON search responses also strip ``thumbnail`` / ``thumbnail_src`` and inline
``data:`` ``img_src`` blobs so API consumers are not flooded with base64.
"""

from __future__ import annotations

import json
import logging
import os

import searx.webapp as _webapp
import searx.webutils as webutils

_LEVEL_NAMES: dict[str, int] = {
    "debug": logging.DEBUG,
    "info": logging.INFO,
    "warning": logging.WARNING,
    "warn": logging.WARNING,
    "error": logging.ERROR,
    "critical": logging.CRITICAL,
}


def _apply_engine_log_level() -> None:
    raw = os.environ.get("SEARXNG_ENGINE_LOG_LEVEL", "critical").strip().lower()
    level = _LEVEL_NAMES.get(raw, logging.CRITICAL)
    logging.getLogger("searx.engines").setLevel(level)


_apply_engine_log_level()


def _strip_embedded_media_blobs(obj: object) -> None:
    """Drop base64 thumbnails and data-URL images from JSON trees (results, infoboxes, …)."""
    if isinstance(obj, dict):
        obj.pop("thumbnail", None)
        obj.pop("thumbnail_src", None)
        img = obj.get("img_src")
        if isinstance(img, str) and img.startswith("data:"):
            obj.pop("img_src", None)
        for v in obj.values():
            _strip_embedded_media_blobs(v)
    elif isinstance(obj, list):
        for el in obj:
            _strip_embedded_media_blobs(el)


_orig_get_json_response = webutils.get_json_response


def _get_json_response_trimmed(sq, rc):
    raw = _orig_get_json_response(sq, rc)
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return raw
    _strip_embedded_media_blobs(data)
    # Default json.dumps(ensure_ascii=True) turns CJK etc. into \uXXXX; UTF-8 is fine on the wire.
    return json.dumps(data, cls=webutils.JSONEncoder, ensure_ascii=False)


webutils.get_json_response = _get_json_response_trimmed

app = _webapp.app
