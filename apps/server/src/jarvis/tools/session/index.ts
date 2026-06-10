import { type ToolSet, tool } from "ai";
import z from "zod";
import type Jarvis from "../..";

const MAX_SESSION_NAME_LENGTH = 100;

export default function createSessionTools(
  jarvis: Jarvis,
  sessionId: string,
): ToolSet {
  return {
    rename_session: tool({
      description:
        "Rename the current conversation title shown in the sidebar history. Call during wrap-up before delivering the final reply when the topic is clear.",
      inputSchema: z.object({
        name: z
          .string()
          .min(1)
          .max(MAX_SESSION_NAME_LENGTH)
          .describe("New conversation title"),
      }),
      inputExamples: [
        { input: { name: "Docker deploy troubleshooting" } },
        { input: { name: "Q2 budget spreadsheet review" } },
      ],
      execute: async (input) =>
        jarvis.session.renameSession(sessionId, input.name),
    }),
  };
}
