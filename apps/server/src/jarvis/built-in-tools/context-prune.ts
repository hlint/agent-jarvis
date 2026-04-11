import { z } from "zod";
import { defineJarvisTool } from "../tool";

export const contextPruneTool = defineJarvisTool({
  name: "context-prune",
  description: "Remove dialog entries by ID.",
  inputSchema: z.object({
    entryIds: z
      .array(z.string())
      .min(1)
      .describe(
        "Dialog entry IDs to remove. Must exist in current dialog history.",
      ),
  }),
  execute: async ({ entryIds }, jarvis) => {
    const dialogHistory = jarvis.state.getState().dialogHistory;
    const idSet = new Set(entryIds);
    const removed: string[] = [];

    for (let i = dialogHistory.length - 1; i >= 0; i--) {
      if (idSet.has(dialogHistory[i].id)) {
        removed.push(dialogHistory[i].id);
        dialogHistory.splice(i, 1);
      }
    }

    return {
      removedCount: removed.length,
      removedIds: removed,
      remainingCount: dialogHistory.length,
      notFound: entryIds.filter((id) => !removed.includes(id)),
    };
  },
});
