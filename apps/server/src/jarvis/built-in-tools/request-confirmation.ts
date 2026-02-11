import type { RequestConfirmationChatEvent } from "@repo/shared/defines/chat-event";
import { nanoid } from "nanoid";
import { z } from "zod";
import { defineJarvisTool } from "../tool";

const requestConfirmationTool = defineJarvisTool({
  name: "request-confirmation",
  description:
    "Use this tool when an action is potentially irreversible, risky, or sensitive and you must obtain explicit user consent before proceeding. It creates a confirmation request for the user and pauses further actions until they respond.",
  inputSchema: z.object({
    brief: z
      .string()
      .describe(
        "Short label describing what needs confirmation. Include key context so the user knows what they are approving.",
      ),
  }),
  execute: async ({ brief }, jarvis) => {
    const event: RequestConfirmationChatEvent = {
      id: nanoid(6),
      role: "request-confirmation",
      time: Date.now(),
      status: "pending",
      brief,
    };
    jarvis.state.addChatEvent(event);
    return {
      requestId: event.id,
      status: event.status,
    };
  },
});

export default requestConfirmationTool;
