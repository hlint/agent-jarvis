import { z } from "zod";
import { defineJarvisTool } from "../tool";

/** 系统强制保留的最近条目数，防止过度裁剪 */
const PRUNE_MIN_RETAIN = 8;

const keepEntryIdsSchema = z
  .array(z.string())
  .describe(
    "Entry ids to keep (besides last N). Others removed. See context-prune memory.",
  );

export const contextPruneTool = defineJarvisTool({
  name: "context-prune",
  description:
    "Remove old entries, keep selected ones. System always retains last N entries.",
  inputSchema: z.object({
    keepEntryIds: keepEntryIdsSchema,
  }),
  execute: async ({ keepEntryIds }, jarvis) => {
    const dialogHistory = jarvis.state.getState().dialogHistory;
    const keepSet = new Set(keepEntryIds);

    // 强制保留最近 N 条
    const retainCount = Math.min(PRUNE_MIN_RETAIN, dialogHistory.length);
    for (
      let i = dialogHistory.length - retainCount;
      i < dialogHistory.length;
      i++
    ) {
      keepSet.add(dialogHistory[i].id);
    }

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

    return {
      success: true,
      preservedCount,
      removedCount,
    };
  },
});
