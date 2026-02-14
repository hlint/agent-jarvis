import { timeFormat } from "@repo/shared/lib/time";
import { shortId } from "@repo/shared/lib/utils";
import { z } from "zod";
import { defineJarvisTool } from "../tool";

const preserveIdsSchema = z
  .array(z.string())
  .describe(
    "History entry ids to KEEP. All other entries will be removed. Use the exact id of each message (e.g. from brief or role). Must include at least the most recent user message and any critical context.",
  );

const summarySchema = z
  .string()
  .min(1)
  .describe(
    "Timeline-style summary: each entry = one line ## Weekday, Month DD, YYYY HH:MM AM/PM then next line with what happened; blank line between entries. Use createdTime from summarized entries. This is the only trace of removed messages.",
  );

export const contextCompressTool = defineJarvisTool({
  name: "context-compress",
  description:
    "Reduce context length by keeping only selected history entries and replacing the rest with a short summary. Use when the dialog is long and you need to stay within context limits while preserving the gist of the conversation.",
  inputSchema: z.object({
    keepEntryIds: preserveIdsSchema,
    summary: summarySchema,
  }),
  execute: async ({ keepEntryIds, summary }, jarvis) => {
    const dialogHistory = jarvis.state.getState().dialogHistory;
    const keepSet = new Set(keepEntryIds);
    const toRemove = dialogHistory
      .map((e) => e.id)
      .filter((id) => !keepSet.has(id));

    for (let i = dialogHistory.length - 1; i >= 0; i--) {
      if (toRemove.includes(dialogHistory[i].id)) {
        dialogHistory.splice(i, 1);
      }
    }

    const preservedCount = dialogHistory.length;
    const removedCount = toRemove.length;

    jarvis.pushHistoryEntry({
      id: shortId(),
      role: "system-event",
      createdTime: timeFormat(),
      brief: "Context compressed by AI Agent",
      content: summary,
      data: {
        type: "context-compressed",
        preservedCount,
        removedCount,
      },
    });

    return {
      success: true,
      preservedCount,
      removedCount,
    };
  },
});
