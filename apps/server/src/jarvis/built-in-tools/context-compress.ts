import type { HistoryEntry } from "@repo/shared/agent/defines/history";
import { timeFormat } from "@repo/shared/lib/time";
import { nanoid } from "nanoid";
import { z } from "zod";
import { defineJarvisTool } from "../tool";

export const contextCompressTool = defineJarvisTool({
  name: "context-compress",
  description:
    "Compress a continuous range of dialog entries into a single summary system-event entry. The new entry's content is the summary and data.type = 'context-compress'.",
  inputSchema: z.object({
    fromEntryId: z
      .string()
      .describe(
        "The first dialog entry id (inclusive) in the range to compress.",
      ),
    toEntryId: z
      .string()
      .optional()
      .describe(
        "The last dialog entry id (inclusive) in the range to compress. If omitted, only fromEntryId will be compressed.",
      ),
    summary: z
      .string()
      .min(1)
      .describe("Summary content for the new compressed system-event entry."),
  }),
  execute: async ({ fromEntryId, toEntryId, summary }, jarvis) => {
    const dialogHistory = jarvis.state.getState().dialogHistory;

    const fromIndex = dialogHistory.findIndex(
      (entry) => entry.id === fromEntryId,
    );
    if (fromIndex === -1) {
      return {
        success: false,
        reason: "fromEntryId not found in dialogHistory",
      };
    }

    let endIndex = fromIndex;
    if (toEntryId) {
      const toIndex = dialogHistory.findIndex(
        (entry) => entry.id === toEntryId,
      );
      if (toIndex === -1) {
        return {
          success: false,
          reason: "toEntryId not found in dialogHistory",
        };
      }
      endIndex = toIndex;
    }

    const startIndex = Math.min(fromIndex, endIndex);
    const finalEndIndex = Math.max(fromIndex, endIndex);

    const compressedEntries = dialogHistory.slice(
      startIndex,
      finalEndIndex + 1,
    );
    const compressedEntryIds = compressedEntries.map((entry) => entry.id);
    const compressedCount = compressedEntries.length;
    const summaryEntry: HistoryEntry = {
      id: nanoid(6),
      role: "system-event",
      createdAt: Date.now(),
      createdTime: timeFormat(),
      status: "completed",
      brief: "Context Compressed",
      content: summary,
      data: {
        type: "context-compress",
        compressedEntryIds,
        compressedEntryCount: compressedCount,
      },
    };

    dialogHistory.splice(startIndex, compressedCount, summaryEntry);

    return {
      compressedCount,
      summaryEntryId: summaryEntry.id,
    };
  },
});
