# Skills

此处记录技能（Skill）的约定与用法。

## 概念

技能是模块化知识包，存放于 runtime 的 `skills/<name>/SKILL.md`，用于扩展 AI 在特定领域的能力。系统在每次对话时只会加载技能的 name 与 description；技能的具体 body 需 AI 通过 [read-file] 主动查阅。

## 加载机制

- **自动加载**：系统扫描 `skills/` 下每个子目录，若有 `SKILL.md`，则解析其 front matter，将 `name` 与 `description` 注入 prompt，作为 `Agent's Skill List` 供 AI 参考。
- **Recall**：body 不自动加载。AI 需根据 description 判断任务相关技能，再用 [read-file] 读取 `skills/<name>/SKILL.md` 获取完整内容。
- **流程**：相关任务 → 先 Recall 对应技能 → 再规划并执行。

## 文件结构

- **路径**：`skills/<name>/SKILL.md`（相对于 runtime），例如 `skills/weather/SKILL.md`。
- **格式**：顶部 YAML front matter，其后为 Markdown body。

| front matter 字段 | 说明                                                  |
| ----------------- | ----------------------------------------------------- |
| name              | 技能标识，默认取目录名                                |
| description       | 简短描述，用于 prompt 中展示，帮助 AI 决定是否 Recall |

body 即技能的具体知识、步骤与规范。推荐：用 `##` 分节、`-` 或编号列表写要点，必要时用表格和代码块，关键术语用 **粗体** 强调。

示例（参见 `skills/weather/SKILL.md`）：

```markdown
---
name: weather
description: Get current weather and forecasts (no API key required).
---

# Weather

## 使用方法

...
```

## 创建与修改

- **新建**：用 [write-file] 写入 `skills/<name>/SKILL.md`。目录会随文件创建。
- **修改**：用 [read-file] 读取，再用 [edit-file] 或 [write-file] 更新。
- **查看目录**：用 [list-dir] 列出 `skills/` 下的技能。

## 何时新建、更新

- 学习了新的工作流程或方法
- 多次试错后总结出有效方案
- 发现任务有固定执行模式，值得标准化
- 遇到重复性任务，需要可复用的指导文档
