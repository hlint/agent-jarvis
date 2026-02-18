import { timeFormat } from "@repo/shared/lib/time";
import { shortId } from "@repo/shared/lib/utils";
import { z } from "zod";
import { defineJarvisTool } from "../tool";

const preserveIdsSchema = z
  .array(z.string())
  .describe("Entry ids to keep. Others removed. See context-compress memory.");

const summarySchema = z
  .string()
  .min(1)
  .describe("Timeline summary. ### time + content per entry.");

export const contextCompressTool = defineJarvisTool({
  name: "context-compress",
  description: "Keep selected entries, replace rest with summary.",
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
