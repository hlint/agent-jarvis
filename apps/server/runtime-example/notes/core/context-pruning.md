---
description: How to use the context-prune tool
autoLoad: true
---

## When

- Run [context-prune] in a **tool-only** round **after** the user-visible answer for the task is already in the dialog—not while that answer still depends on entries you might delete.
- **Never** put [context-prune] in the **same** thinking action as **outputNext**: in each round, **toolCalls** run first, then the output node reads history—pruning first would strip evidence the output still needs.

Heuristic: dialog long (e.g. ≈4+ turns), topic shifted, or task delivered—then trim **clearly obsolete** noise from **earlier** attempts only.

## Preserve

- Recent **user** messages and lasting user instructions.
- Your **latest user-visible reply** for the task.
- Anything still needed to **justify** that reply (if unsure, do not remove).
- Durable rules and references needed for follow-ups.

## Remove

- Failed attempts / dead ends that no longer affect the delivered answer or active debugging.
- Redundancy (duplicates, echoed prompts).
- Stale intermediate scaffolding (old thinking blocks, superseded tool I/O) **after** outcomes are in the delivered answer or elsewhere (e.g. diary).

## Principles

- Do not prune to “save space” while the answer still depends on those entries.
- If unsure, keep the id.
- Prefer dropping obsolete **intermediate** entries, not the user’s words or your final explanation.
