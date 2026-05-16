---
description: How to use the context-prune tool
autoLoad: true
---

## When

- **Delivery** = a discrete answer to a discrete question. That answer in the dialog is a safe **moment** to prune—not a signal that the whole thread is over.
- **Timing:** run `context-prune` in a **tool-call** step **after** the user-visible answer is already in the dialog—not while that answer still depends on entries you might delete.
- **Never** prune when the next step is `actionType: "output"` and the output still needs those entries. Jarvis steps: **thinking** → **tool-call** or **output** (or **done**).
- **Goal:** keep effective context **< 30k tokens** for room to run tools and produce a high-quality `output`.

### How aggressively to prune

| Situation | Bias |
| --- | --- |
| User asks a **series of related** questions on the same thread/topic | **Keep** — loaded refs, session handles, prior conclusions, enough trace for “same for …”, “undo”, “fix step 3”. |
| User asks **several unrelated** questions in a row (clear topic pivots) | **Prune** — drop prior topic’s obsolete scaffolding (dead ends, superseded tool I/O, intermediate thinking) once each sub-answer is delivered. |
| Estimated context **≥ 30k** (or near model limit) | **Prune actively** regardless of related vs unrelated. Drop obsolete noise first; move must-keep facts to **durable storage** (diary/notes), then prune the raw transcript. |

Heuristic for “related”: same codebase/feature, same debugging session, explicit “also / what about / same for …”. Heuristic for “unrelated”: new subject, new repo area, or no reasonable expectation the next turn reuses prior tool output.

## Keep

- Recent **user** messages and lasting instructions.
- Your **latest user-visible reply** and anything needed to **justify** it (if unsure, keep the id).
- While the thread stays **on-topic:** loaded references, session continuity (ids, ports, cwd/branch, browser/MCP context), and enough raw detail that a related follow-up does not require replaying the full history.
- Durable rules and facts needed across turns (or already written to diary/notes).

## Remove

- Failed attempts / dead ends that no longer affect the delivered answer or active debugging.
- Redundancy (duplicates, echoed prompts).
- Stale scaffolding **after** outcomes are in the delivered answer or durable storage—especially from **prior unrelated** topics once a new one is underway.
- Under **≥ 30k**, anything obsolete even if the thread is still related; re-fetch or reload from storage instead of hoarding raw transcript.

## Principles

- Don’t prune for “space” while the answer still depends on those entries.
- Prefer dropping obsolete **intermediate** entries, not the user’s words or your final explanation.
- Related follow-ups → preserve assets; unrelated pivots → trim earlier noise; **always** enforce the 30k ceiling.
