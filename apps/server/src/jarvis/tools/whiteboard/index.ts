import { type ToolSet, tool } from "ai";
import z from "zod";
import { PATH_DESC } from "../../../lib/runtime-path";
import type Jarvis from "../..";

export default function createWhiteboardTools(
  jarvis: Jarvis,
  sessionId: string,
): ToolSet {
  return {
    navigate_whiteboard: tool({
      description:
        "Navigate the current session whiteboard to a runtime HTML file. The user sees the page in the right-side iframe immediately. Use after creating or updating an HTML file, or to return to home.html. Navigating to the same path refreshes the page.",
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            `${PATH_DESC} Prefer .html files under workspace/ for interactive pages.`,
          ),
      }),
      inputExamples: [
        { input: { path: "home.html" } },
        { input: { path: "workspace/dashboard.html" } },
      ],
      execute: async (input) => {
        const result = jarvis.session.setWhiteboardPath(sessionId, input.path, {
          recordRecent: true,
        });

        if (result.success) {
          jarvis.ws.pushWsMessage({
            type: "layout-open-panel",
            data: { panel: "whiteboard" },
          });
        }

        return result;
      },
    }),
  };
}
