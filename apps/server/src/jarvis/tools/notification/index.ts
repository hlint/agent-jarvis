import { tool } from "ai";
import z from "zod";
import type Jarvis from "../..";

const MAX_CONTENT_LENGTH = 2000;

export default function createNotificationTool(
  jarvis: Jarvis,
  sessionId: string,
) {
  return tool({
    description:
      "Send the user a short alert or status update. Use for concise summaries worth surfacing immediately; persist detailed results to files when the full output matters.",
    inputSchema: z.object({
      content: z
        .string()
        .min(1)
        .max(MAX_CONTENT_LENGTH)
        .describe("Notification body shown to the user"),
      source: z
        .string()
        .max(100)
        .optional()
        .describe("Optional label for audit, e.g. cron task name or 'agent'"),
    }),
    inputExamples: [
      {
        input: {
          content: "Daily disk check: /data is at 92% capacity.",
          source: "cron:disk-check",
        },
      },
      {
        input: {
          content: "Finished analyzing the README — see workspace/report.md.",
        },
      },
    ],
    execute: async (input) => {
      const session = jarvis.session.getSession(sessionId);
      const source =
        input.source?.trim() ||
        (session?.type === "subagent-cron"
          ? "cron"
          : session?.type === "subagent-tool"
            ? "subagent"
            : "agent");

      const result = jarvis.notification.createNotification({
        content: input.content,
        source,
      });

      if (result.success) {
        jarvis.ws.pushWsMessage({
          type: "layout-open-panel",
          data: { panel: "sidebar" },
        });
      }

      return result;
    },
  });
}
