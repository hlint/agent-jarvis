/**
 * SKILL 能力包说明与当前可用技能列表。
 * 技能文件为 .md，采用 YAML frontmatter + body 格式，由 parseFrontmatterMd 解析。
 */

import { join } from "node:path";
import fm from "front-matter";
import fs from "fs-extra";
import { DIR_SKILLS } from "../../defines";

export const SKILL_HEADER = `一种能力包：用说明文字教你在某领域或任务上该怎么做事，相当于「入职指南」。

每个 SKILL 包含：
- **name**：技能名称，仅允许英文字母、数字及符号 - 和 _，用于唯一标识（如 weather、travel-dest、summarize）。
- **description**：简短说明该技能做什么、在什么情况下使用。你主要依据 description 决定是否使用该技能，请把「做什么」和「何时用」写清楚。
- **body**：具体使用说明与步骤（流程、命令、经验、示例等）。只有在你决定使用该技能后才会被加载进上下文，用于指导执行。

你可以通过工具 [review-skill] 查看某个技能的详细说明。
你可以通过工具 [upsert-skill] 创建或更新某个技能（不存在则创建，存在则按需更新属性与内容）。

**拆分大技能**：若某个技能体量过大、涵盖多个相对独立子主题，建议拆成多个小技能，每个技能只负责一个清晰场景，便于按需选用。例如「旅行规划」可拆为（name 需符合上述规范）：
- travel-dest：旅行目的地调研
- visa-and-flights：签证与机票预订
- itinerary-and-accommodation：行程与住宿安排
- packing-and-tips：行李与注意事项

拆分时保持每个技能的 name 与 description 单一明确，body 只写该子主题的步骤与示例。

当前可用 SKILL 列表：

`;

/** 当前注入的 SKILL 摘要（name + description）。body 在选用时由 skill 系统加载。 */
export function getSkillSection(): string {
  let list: string[];
  try {
    const files = fs.readdirSync(DIR_SKILLS).filter((f) => f.endsWith(".md"));
    list = files.map((file) => {
      const raw = fs.readFileSync(join(DIR_SKILLS, file), "utf-8");
      const { attributes } = fm(raw);
      const metadata = attributes as { name: string; description: string };
      const name = metadata.name;
      const description = metadata.description;
      return `${name} - ${description}`;
    });
  } catch {
    list = [];
  }
  const skillsSummary = list.length > 0 ? list.join("\n") : "暂无";
  return `${SKILL_HEADER + skillsSummary}\n`;
}
