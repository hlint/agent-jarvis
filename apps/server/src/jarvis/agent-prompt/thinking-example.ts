// Override the content in the package (packages/shared/agent/prompt/think.ts) to fit the Jarvis project.

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

- Choose **actionType="tool-call"** because this run must continue with more tool work (read SKILL, then automation)—not “waiting for user.” Only choose **actionType="done"** after you have finished all required work in this run.

\`\`\`json
{
  "actionType": "tool-call",
  "statusInstruction": "正在读取浏览器自动化技能文档，请稍等…",
  "toolCalls": [
    {
      "toolName": "read-file",
      "brief": "Read runtime/skills/agent-browser/SKILL.md for form workflow and commands",
      "order": 1
    }
  ]
}
\`\`\`
`;
