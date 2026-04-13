---
description: How to use the context-prune tool
autoLoad: true
---

## When

- Run [context-prune] in a **tool-only** round **after** the user-visible answer for the task is already in the dialog—not while that answer still depends on entries you might delete.
- **Never** put [context-prune] in the **same** thinking action as **outputNext**: in each round, **toolCalls** run first, then the output node reads history—pruning first would strip evidence the output still needs.

Heuristic: dialog long (e.g. ≈4+ turns), topic shifted, or task delivered—then trim **clearly obsolete** noise from **earlier** attempts only.

**Not the same as “thread ended.”** “Task delivered” does **not** mean the user will stop asking **related** follow-ups. Do not use pruning to wipe **reusable** context you would otherwise **reload or re-derive** on the next turn.

## Continuity (likely follow-ups on the same thread)

Pruning should remove **obsolete noise**, not **assets** that are still **cheap for this thread but expensive to recreate**: loaded reference material, stable environmental facts, and minimal state for continuing the same kind of work.

**Keep (until the topic clearly shifts or you must meet a hard context limit):**

1. **Loaded references** — Text you explicitly pulled into the turn (notes, specs, skills, long doc excerpts, retrieved chunks). If the user may ask another question in the **same area**, dropping the full body forces a **repeat fetch** and duplicated setup. Prefer keeping the material or a **dense summary you would actually reuse**, not a vague one-liner that omits constraints.
2. **Environment and session continuity** — Facts and handles the next instruction may need again: tool/session identifiers, ports or endpoints, cwd or branch, feature flags, “last X we touched,” remote/browser/MCP attachment context—unless the user asked to reset or start clean.
3. **Trace depth vs. redundancy** — After conclusions are in your reply, you may still remove **duplicate** or **superseded** tool output. Keep **enough** raw detail that a follow-up (“same for …”, “undo that”, “fix step 3”) does not require replaying the entire history from zero **while** the conversation is still on that thread.

**Examples (non-exhaustive):** a skill or project note you read for the task; browser/CDP/session flags and last relevant URL; MCP resource bodies you relied on; file paths and symbols central to the current edit.

Reserve **aggressive** cuts of the categories above for **topic shift**, explicit archival/summary, or **hard** context limits—not routine “cleanup” after every sub-task.

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
