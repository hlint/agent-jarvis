import { DIVIDER } from "@repo/shared/agent/defines/text";

export const thinkingExample = `
**Status**

- User: "Go to example.com/contact, fill the form with name/email/message, submit it, and screenshot the thank-you page."
- Multi-step: navigate → snapshot for refs → fill → click submit → wait → screenshot. agent-browser skill matches; body not loaded (<Body Not Loaded>). Form workflow (snapshot -i, fill @ref, click) requires exact syntax from SKILL.

**Strategy**

- Complex automation; cannot guess commands. Per rule: body not loaded → must [read-file] first, no substitute. Path: skills/agent-browser/SKILL.md. After reading, may need references/ for form patterns. Reflect: first step, nothing to correct.

**Next**

- done=false; need skill content before exec.

${DIVIDER}

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
