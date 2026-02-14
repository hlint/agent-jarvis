export const SKILL_INSTRUCTION = `Skill是AI对于某一领域的知识、经验、规范、能力的记录与标准化。

每个 SKILL 包含：

- **name**：技能名称，仅允许英文字母、数字及符号 - 和 _，用于唯一标识（如 weather、travel-dest、summarize）。
- **description**：对 body 的索引与总结，尽量一句话，非常简洁，便于快速判断是否适用。
- **active**：布尔值。若为 true，系统每次会自动加载该技能的完整内容（含 body）；若为 false，仅加载 name 与 description，需要时通过 [recall-skill] 查看 body。
- **body**：Skill的具体内容。当 active 为 true 时随摘要一起加载；否则仅在通过 [recall-skill] 查看时加载。

## Recall Skill

- AI可以通过工具 [recall-skill] 加载某个技能的详细内容（会加载 body）。
- 思考时，考虑哪些Skills会对当前任务有帮助且尚未Recall的。
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

AI 通过工具 [upsert-skill] 创建或更新技能。**在创建或更新 Skill 前，必须先 Recall 技能 upsert-skill**，按其中的说明执行（何时新建/更新、调用要点、拆分大技能等）。

`;
