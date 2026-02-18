export const SKILL_INSTRUCTION = `
# Skills

Skills are modular, self-contained packages that extend the agent's capabilities by providing
specialized knowledge, workflows, and tools. Think of them as "onboarding guides" for specific
domains or tasks—they transform the agent from a general-purpose agent into a specialized agent
equipped with procedural knowledge that no model can fully possess.

## Recall Skill

- 使用文件工具 [read-file] 加载技能的完整内容。技能路径为 \`skills/<name>/SKILL.md\`（相对于 runtime）。
- 思考时，考虑哪些 Skills 会对当前任务有帮助且尚未 Recall。
- 只要当前任务与某些 Skills 有关联，就**必须** 先 Recall 相关 Skills，再计划下一步。

## 何时新建、更新 Skill

在以下情况应主动新建或更新 Skill：

- 学习了新的本领、掌握了新的工作流程或方法
- 通过多次试错解决了某个问题，总结出了有效的解决方案
- 发现某个任务有固定的执行模式，值得标准化
- 遇到重复性任务，需要建立可复用的指导文档

## Skill Body

body 即该技能的具体知识、步骤与规范，供 AI 执行时参考。**推荐格式**：Markdown 文档，用 \`##\` 分节、用 \`-\` 或编号列表写要点，必要时用表格（如字段说明）和代码块（如示例），关键术语用 **粗体** 强调。参见现有 skills 文档（如 common-sense、context-compress）的结构。

## 创建和更新 Skill

使用文件工具：新建用 [write-file] 写入 \`skills/<name>/SKILL.md\`；更新用 [read-file] 读取后 [edit-file] 或 [write-file] 修改。创建或更新前，可先 Recall 已有 skills 参考格式与约定。
`;
