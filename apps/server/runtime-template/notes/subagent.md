<!-- Purpose: When to dispatch subagents, Subagent mode behavior, division of labor with main agent and other tools. -->

# Subagent

A Subagent is a **separate agent session** spawned to complete a subtask in an isolated context. After the task ends, the session is deleted automatically (moved to recycle bin).

## Subagent mode

**`Session Type`** in `<SYSTEM_ENVIRONMENT>` indicates the current session type. If it is `subagent-tool` or `subagent-cron`, you are in **Subagent mode** — not the user's main conversation, but dispatched to execute a specific task.

In this mode you should:

- **Only do the assigned task**; do not expand scope or start new topics on the user's behalf
- **Same plan-phase rules as other sessions**: text-only reply, or **`setup_plan` before other tools**; the board is valid only for this turn
- **The final reply is the deliverable** (`subagent-tool` returns via `call_subagent` to the main agent; `subagent-cron` has no conversation recipient — see table below)
- **Fewer tools than the main session** (e.g. no `call_subagent`, `rename_session`, whiteboard, `list_cron_tasks`, etc.) — **this is by design**; do not try to call tools that do not exist; complete the work with what you have

| Session Type    | Trigger                       | How you deliver                                                                              |
| --------------- | ----------------------------- | -------------------------------------------------------------------------------------------- |
| `basic`         | User conversation             | Normal chat; may use `call_subagent` for subtasks                                            |
| `subagent-tool` | Main agent calls `call_subagent` | Concise, self-contained final reply (returned to main agent)                             |
| `subagent-cron` | Scheduled task fires          | Write files; optionally **`create_notification` / `exec` CLI** etc. to alert user; **do not leave messages in user session** |

Subagent sessions are not visible in the frontend.

## Core advantages (main agent perspective)

| Advantage           | Description                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Parallelism**     | Multiple independent complex subtasks can run as separate subagents while the main agent waits and synthesizes — no serial pile-up in one context |
| **Context isolation** | Search summaries, multi-page fetches, cross-file scans **stay inside the subagent**; the main context only gets a refined conclusion, avoiding token bloat and noise diluting attention |

Typical beneficiaries: **web research** (many queries, long sources, user only wants conclusions), **multi-source comparison** (search each source independently then summarize), **heavy scanning** (glob + read many files, final output is a list or summary).

## When to use (main agent)

### Use `call_subagent`

- The subtask itself is multi-step (multiple web searches, read many files, exec + analysis)
- Intermediate output is large or verbose; **user/main agent only needs the conclusion**
- **2+ independent** subtasks can run in parallel (dispatch one subagent each, then summarize)
- You want trial-and-error and retries in the subtask without polluting main conversation history

### Do it yourself (main agent calls tools directly)

- **Single step, lightweight**: read one file, one web search, one command
- Intermediate results are small, or the main agent **still needs the raw details** later

### Use `multimodal_subagent`

- Single-shot multimodal understanding: transcribe audio, recognize image, read PDF snippet
- No multi-step tool orchestration; no full agent loop needed

### Quick decision guide

```
Multi-step tool chain needed?
  No → Multimodal? → multimodal_subagent / call tools directly
  Yes → Will intermediate results be large, or need parallel similar tasks?
        Yes → call_subagent
        No → Single short subtask → do it yourself; otherwise still prefer call_subagent
```

## Usage notes (`call_subagent`)

- **`sessionName`** (required): Short title for audit, e.g. `AWS spot pricing`
- **`instruction`**: State the task and **expected output form** (table, bullet list, whether to include sources, etc.)
- **Persistent artifacts**: Reuse across sessions → `workspace/<slug>/data/`; this subtask only → subagent's own `sessions/<id>/artifacts/`

## Examples

### Parallel research (advantages 1 + 2)

User: "Compare AWS / GCP / Azure spot instance pricing in us-east-1."

Dispatch three subagents in parallel, each searches, reads, and organizes; main context receives three short conclusions, then synthesize a comparison table. Serial search in the main session would stack six or more rounds of search summaries into main context.

### Large intermediate results, conclusion only (advantage 2)

User: "Research React 19 breaking changes vs 18; give me bullet points."

Subagent handles multiple searches and doc reads; returns a list of ≤10 breaking changes. Raw search results and long excerpts do not enter the main session.

### When not to dispatch a subagent

- "Read scripts in `package.json`" → one `read_file` is enough
- "What's in this screenshot" → `multimodal_subagent`
