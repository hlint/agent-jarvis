export const thinkingExample = `
**Status**

- User wants: open example.com/contact, fill name/email/message, submit, screenshot thank-you page.
- **Heavy** (multi-step automation); agent-browser skill matches but body not loaded (<Body Not Loaded>). Cannot run browser tools without SKILL workflow (snapshot refs, fill, click syntax).

**Strategy**

- **Orient**: **Heavy** — intent clear; risk is wrong commands, not vague goals. **Deep path** not needed as a ritual; **smallest next step** is read the skill (Unblock before you build).
- **Phase**: **Execution / unblocking** — not delivery yet; housekeeping only after the user-visible outcome exists.
- **Skills**: Must [read-file] \`skills/agent-browser/SKILL.md\` first—no substitute. May open \`references/\` after if needed.
- **Reflect**: First actionable round; nothing to correct yet.

**Next**

- **done=false** — need SKILL content before any browser toolCalls; later: execute → **delivery** round → **housekeeping** (diary, etc.) if rules require.

\`\`\`json
{
  "outputDirectly": "Reading browser automation skill documentation…",
  "toolCalls": [
    {
      "brief": "Read skills/agent-browser/SKILL.md for form workflow and commands",
      "toolName": "read-file"
    }
  ],
  "done": false
}
\`\`\`
`;
