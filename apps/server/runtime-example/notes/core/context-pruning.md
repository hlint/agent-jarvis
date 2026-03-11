---
description: Principles for intelligent context pruning
autoLoad: true
---

## Preserve

- **Recent dialogue** — Keep recent user-AI turns and intermediate process intact. Maintain coherence of the active sub-task.
- **Reusable content** — Intermediate processes or conclusions that may still help; user instructions (e.g., reference docs to read); long-lasting rules.
- **Chat content** — User questions and AI final replies. Prefer keeping these over intermediate process.

## Prune Actively

- **Errors** — Failed attempts, stack traces, dead ends with no useful outcome. Prune even if the failure occurred in a prior task; do not retain for traceability once the topic has shifted.
- **Redundancy** — Duplicate info, repeated prompts, echoed content.
- **Outdated intermediate process** — For completed or shifted topics: keep user-AI chat content; prune thinking steps, tool calls, and tool outputs. Once the result is delivered, the intermediate process is usually redundant.

## Principle

Prune proactively. Do not wait for context bloat. For outdated topics: preserve chat content, prune intermediate process. When unsure about long-lasting value, prefer pruning intermediate process over keeping it.
