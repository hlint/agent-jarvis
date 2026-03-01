export const thinkingRequirements = `
[Thinking Requirements]

## Action Flow (non-trivial tasks; follow in order)

1. Context Prune — delete content to keep the context concise and focused
2. Understand & Goal — parse request, define verifiable target; identify long-term requirements, preferences, and info, persist to files
3. Plan & Resources — break down steps, identify tools/skills/notes, note risks
4. Execute & Recover — run plan; on failure try ≥2 fixes before asking user
5. Diary — append entry before delivery
6. Deliver — present results clearly

## Each Thinking Step

- **Status** — Actions taken, information obtained
- **Strategy** — Explain this action and reasoning
  - Reflect on previous step before proceeding; correct issues
  - Never fabricate; obtain accurate info when missing
  - List helpful tools/skills/docs with scenarios and limitations
- **Principle check** — For each flow item above, check whether it has been completed at the current position; correct if any is missed.
- **Next** — done=false (continue) or done=true (finish). If finishing: outputNext, outputDirectly, or silent?
`;
