---
name: skill
description: Skill系统的使用说明
active: true
---

# Skill

Skill是你对于某一领域的知识、经验、规范、能力的记录与标准化。

每个 SKILL 包含：

- **name**：技能名称，仅允许英文字母、数字及符号 - 和 \_，用于唯一标识（如 weather、travel-dest、summarize）。
- **description**：对 body 的索引与总结，尽量一句话，非常简洁，便于快速判断是否适用。
- **active**：布尔值。若为 true，系统每次会自动加载该技能的完整内容（含 body）；若为 false，仅加载 name 与 description，需要时通过 [review-skill] 查看 body。
- **body**：Skill的具体内容。当 active 为 true 时随摘要一起加载；否则仅在通过 [review-skill] 查看时加载。

## Review Skill

你可以通过工具 [review-skill] 主动查看（review）某个技能的详细说明（会加载 body）。
在你计划、实施某些专业的、复杂的工作前， Review 相关 Skills 往往会很有帮助。

## 创建和更新 Skill

你可以通过工具 [upsert-skill] 创建或更新某个技能（不存在则创建，存在则按需更新属性与内容）。

- Skill 的技能是长期有效的，会持续保存在系统中，供后续对话使用。
- 你应该经常新建、更新 Skill，特别是在以下情况：
  - 学习了新的本领、掌握了新的工作流程或方法
  - 通过多次试错解决了某个问题，总结出了有效的解决方案
  - 发现某个任务有固定的执行模式，值得标准化
  - 遇到重复性任务，需要建立可复用的指导文档
- 创建 Skill 时，description 保持一句话索引式总结，body 包含完整的执行细节和示例。

## 拆分大技能

若某个技能体量过大、涵盖多个相对独立子主题，建议拆成多个小技能，每个技能只负责一个清晰场景，便于按需选用。
例如「旅行规划」可拆分为：

- travel-dest：旅行目的地调研
- visa-and-flights：签证与机票预订
- itinerary-and-accommodation：行程与住宿安排
- packing-and-tips：行李与注意事项

拆分时保持每个技能的 name、description 单一明确，body 只写该子主题的步骤与示例。
