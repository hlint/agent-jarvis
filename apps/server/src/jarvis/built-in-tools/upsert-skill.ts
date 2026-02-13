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
    "Create or update a skill. data fields are optional in update mode only.",
  inputSchema: z.object({
    mode: z
      .enum(["create", "update"])
      .describe(
        "create: add a new skill (target name must not exist). update: modify an existing skill (target must exist).",
      ),
    name: z
      .string()
      .regex(SKILL_NAME_REGEX, SKILL_NAME_MSG)
      .describe(
        "When creating: the name for the new skill. When updating: the current skill name.",
      ),
    data: z
      .object({
        name: z.string().regex(SKILL_NAME_REGEX, SKILL_NAME_MSG).optional(),
        description: z
          .string()
          .optional()
          .describe("说明该技能是关于什么的。创建时必填。"),
        whenToReview: z
          .string()
          .optional()
          .describe(
            "何时需要 review，格式示例：在xxx时推荐review，在xxx时必须review。创建时必填。",
          ),
        tips: z
          .string()
          .optional()
          .describe("一些零碎的重要知识点，可以为空（Empty）。创建时必填。"),
        body: z.string().optional(),
      })
      .describe("Skill data fields to create or update."),
  }),
  execute: async ({ mode, name, data }) => {
    const path = join(DIR_SKILLS, `${name}.md`);
    const exists = fs.pathExistsSync(path);

    if (mode === "create") {
      if (
        data.description === undefined ||
        data.whenToReview === undefined ||
        data.tips === undefined
      ) {
        return {
          success: false,
          message:
            "创建技能时 data.description、data.whenToReview、data.tips 均为必填。",
        };
      }
      fs.ensureDirSync(DIR_SKILLS);
      const targetName = data.name ?? name;
      const targetPath = join(DIR_SKILLS, `${targetName}.md`);
      if (fs.pathExistsSync(targetPath)) {
        return {
          success: false,
          message: `无法创建：已存在名为「${targetName}」的技能文件。`,
        };
      }
      const attrs: Record<string, string> = {
        name: targetName,
        description: data.description,
        whenToReview: data.whenToReview,
        tips: data.tips,
      };
      const content = stringifyFrontmatterMd(attrs, data.body ?? "");
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
        message: `无法更新：未找到名为「${name}」的技能（对应文件 ${name}.md）。`,
      };
    }

    const raw = fs.readFileSync(path, "utf-8");
    const { attributes, body } = fm<Record<string, string>>(raw);
    const attrs = { ...attributes };
    if (data.name !== undefined) attrs.name = data.name;
    if (data.description !== undefined) attrs.description = data.description;
    if (data.whenToReview !== undefined) attrs.whenToReview = data.whenToReview;
    if (data.tips !== undefined) attrs.tips = data.tips;
    const bodyToWrite = data.body !== undefined ? data.body : body.trim();

    const content = stringifyFrontmatterMd(attrs, bodyToWrite);

    if (data.name !== undefined && data.name !== name) {
      const newPath = join(DIR_SKILLS, `${data.name}.md`);
      if (fs.pathExistsSync(newPath) && newPath !== path) {
        return {
          success: false,
          message: `无法重命名：已存在名为「${data.name}」的技能`,
        };
      }
      fs.writeFileSync(newPath, content, "utf-8");
      fs.removeSync(path);
      return {
        success: true,
        message: `已更新技能并重命名：${name} → ${data.name}`,
        name: data.name,
      };
    }

    fs.writeFileSync(path, content, "utf-8");
    return {
      success: true,
      message: `已更新技能「${name}」`,
      name: attrs.name ?? name,
    };
  },
});
