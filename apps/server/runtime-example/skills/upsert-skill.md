---
name: upsert-skill
description: 如何创建、更新 Skill，何时拆分大技能。如果只是想要更新skill的元数据（无body），则无需recall本技能。
active: false
---

# 创建和更新 Skill

AI 通过工具 [upsert-skill] 创建或更新技能（不存在则创建，存在则按需更新属性与内容）。Skill 长期有效，会持续保存在系统中供后续对话使用。

## 调用 [upsert-skill] 的要点

1. **mode**：`create` 新增（目标 name 不得已存在）；`update` 修改（目标必须存在）。
2. **name**：create 时为新技能名；update 时为当前技能名。仅允许英文字母、数字及 `-`、`_`（如 `travel-dest`、`dayjs-usage`）。
3. **data**：可选字段。create 时 `description` 必填；update 时可按需更新 `name`、`description`、`active`、`body` 任一或多个。
4. **description**：一句话索引式总结，便于快速判断是否适用。
5. **body**：完整的执行细节和示例，Markdown 格式，用 `##` 分节、列表、表格、代码块，参见现有 skills 结构。

## Skill body 示例

```markdown
# 周报

当用户需要生成或发送周报时，可以参考本技能。

## 何时触发

- 用户明确要求「写周报」「发周报」「总结本周」
- 系统定时任务中配置了周报（如每周五 18:00）

## 步骤

1. 回顾本周日记与上下文，提炼完成事项、进展、问题。
2. 按用户偏好格式组织（若无偏好则用：工作摘要 / 待办 / 备注）。
3. 若用户已配置发送方式（如邮件），调用对应工具发送；否则直接回复正文。

## 注意事项

- **篇幅**：控制在一屏内，每条一句话。
- **敏感信息**：不写入周报的私密或敏感内容。
```

## 拆分大技能

若某个技能体量过大、涵盖多个相对独立子主题，建议拆成多个小技能，每个技能只负责一个清晰场景，便于按需选用。

例如「旅行规划」可拆分为：

- `travel-dest`：旅行目的地调研
- `visa-and-flights`：签证与机票预订
- `itinerary-and-accommodation`：行程与住宿安排
- `packing-and-tips`：行李与注意事项

拆分时保持每个技能的 name、description 单一明确，body 只写该子主题的步骤与示例。
