import { join } from "node:path";
import fm from "front-matter";
import fs from "fs-extra";
import { z } from "zod";
import { DIR_SKILLS } from "../defines";
import { defineJarvisTool } from "../tool";
import { stringifyFrontmatterMd } from "../utils";

const SKILL_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const SKILL_NAME_MSG = "仅允许字母、数字、连字符 - 和下划线 _";

export const upsertSkillTool = defineJarvisTool({
  name: "upsert-skill",
  description:
    "Create or update a skill. newName/newDescription/newBody are optional in update mode only.",
  inputSchema: z.object({
    brief: z
      .string()
      .describe(
        "Short label, e.g. 'create travel-dest skill' or 'update cron'",
      ),
    mode: z
      .enum(["create", "update"])
      .describe(
        "create: add a new skill (target name must not exist). update: modify an existing skill (target must exist).",
      ),
    skillName: z
      .string()
      .regex(SKILL_NAME_REGEX, SKILL_NAME_MSG)
      .describe(
        "When creating: the name for the new skill. When updating: the current skill name.",
      ),
    newName: z.string().regex(SKILL_NAME_REGEX, SKILL_NAME_MSG).optional(),
    newDescription: z
      .string()
      .optional()
      .describe("New description. Required when mode is create."),
    newBody: z.string().optional(),
  }),
  execute: async ({ mode, skillName, newName, newDescription, newBody }) => {
    const path = join(DIR_SKILLS, `${skillName}.md`);
    const exists = fs.pathExistsSync(path);

    if (mode === "create") {
      if (newDescription === undefined) {
        return {
          success: false,
          message: "创建技能时 newDescription 为必填。",
        };
      }
      fs.ensureDirSync(DIR_SKILLS);
      const targetName = newName ?? skillName;
      const targetPath = join(DIR_SKILLS, `${targetName}.md`);
      if (fs.pathExistsSync(targetPath)) {
        return {
          success: false,
          message: `无法创建：已存在名为「${targetName}」的技能文件。`,
        };
      }
      const attrs: Record<string, string> = {
        name: targetName,
        description: newDescription,
      };
      const content = stringifyFrontmatterMd(attrs, newBody ?? "");
      fs.writeFileSync(targetPath, content, "utf-8");
      return {
        success: true,
        message: `已创建技能「${targetName}」`,
        name: targetName,
      };
    }

    // mode === "update"
    if (!exists) {
      return {
        success: false,
        message: `无法更新：未找到名为「${skillName}」的技能（对应文件 ${skillName}.md）。`,
      };
    }

    const raw = fs.readFileSync(path, "utf-8");
    const { attributes, body } = fm<Record<string, string>>(raw);
    const attrs = { ...attributes };
    if (newName !== undefined) attrs.name = newName;
    if (newDescription !== undefined) attrs.description = newDescription;
    const bodyToWrite = newBody !== undefined ? newBody : body.trim();

    const content = stringifyFrontmatterMd(attrs, bodyToWrite);

    if (newName !== undefined && newName !== skillName) {
      const newPath = join(DIR_SKILLS, `${newName}.md`);
      if (fs.pathExistsSync(newPath) && newPath !== path) {
        return {
          success: false,
          message: `无法重命名：已存在名为「${newName}」的技能`,
        };
      }
      fs.writeFileSync(newPath, content, "utf-8");
      fs.removeSync(path);
      return {
        success: true,
        message: `已更新技能并重命名：${skillName} → ${newName}`,
        name: newName,
      };
    }

    fs.writeFileSync(path, content, "utf-8");
    return {
      success: true,
      message: `已更新技能「${skillName}」`,
      name: attrs.name ?? skillName,
    };
  },
});
