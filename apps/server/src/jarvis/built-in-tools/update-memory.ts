import fs from "fs-extra";
import { z } from "zod";
import { PATH_MEMORY } from "../defines";
import { defineJarvisTool } from "../tool";

const updateMemoryTool = defineJarvisTool({
  name: "update-memory",
  description:
    "Replace the entire memory file content with the given content. This is a full replacement, not a partial update - the entire memory file will be overwritten.",
  inputSchema: z.object({
    brief: z.string().describe("A brief description of this tool call"),
    content: z
      .string()
      .describe(
        "The complete content to replace the entire memory file with. This will completely overwrite the existing memory file.",
      ),
  }),
  execute: async ({ content }) => {
    fs.writeFileSync(PATH_MEMORY, content);
    return { success: true };
  },
});

export default updateMemoryTool;
