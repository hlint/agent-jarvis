import { timeFormat } from "@repo/shared/lib/time";
import fs from "fs-extra";
import { z } from "zod";
import { defineJarvisTool } from "../tool";
import { getDiaryPath } from "../utils";

const writeDiaryTool = defineJarvisTool({
  name: "write-diary",
  description:
    "Append a diary entry to today's diary. Use to record what you did or learned since the last entry. Keep entries brief.",
  inputSchema: z.object({
    content: z.string().describe("The diary entry content to append."),
  }),
  execute: async ({ content }) => {
    const path = getDiaryPath();
    await fs.ensureFile(path);
    await fs.appendFile(path, `[${timeFormat()}]\n${content}\n\n`);
    return { success: true };
  },
});

export default writeDiaryTool;
