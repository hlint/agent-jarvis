import { join } from "node:path";
import fm from "front-matter";
import fs from "fs-extra";
import { z } from "zod";
import { DIR_SKILLS } from "../defines";
import { defineJarvisTool } from "../tool";

export const reviewSkillTool = defineJarvisTool({
  name: "review-skill",
  description:
    "View the full documentation of a skill by its name. Returns the skill's name, description, and full body (detailed instructions). Use when you need to follow a skill's steps or check its usage.",
  inputSchema: z.object({
    brief: z
      .string()
      .describe("Short label for this call, e.g. 'review cron skill'"),
    skillName: z
      .string()
      .regex(/^[a-zA-Z0-9_-]+$/, "仅允许字母、数字、连字符 - 和下划线 _")
      .describe(
        "The name of the skill to review, as shown in the SKILL list (e.g. 'cron').",
      ),
  }),
  execute: async ({ skillName }) => {
    const path = join(DIR_SKILLS, `${skillName.trim()}.md`);
    if (!fs.pathExistsSync(path)) {
      return {
        found: false,
        message: `未找到技能「${skillName}」（对应文件 ${skillName}.md）。请根据当前 SKILL 列表中的 name 填写。`,
      };
    }
    const raw = fs.readFileSync(path, "utf-8");
    const { attributes, body } = fm<{ name?: string; description?: string }>(
      raw,
    );
    return {
      found: true,
      name: attributes.name ?? skillName,
      description: attributes.description ?? "",
      body: body.trim(),
    };
  },
});
