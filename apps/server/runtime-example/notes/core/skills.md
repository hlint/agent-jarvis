---
description: 技能的概念、加载机制、何时新建、更新
autoLoad: true
---

## 概念

技能是模块化知识包，存放于 runtime 的 `skills/<name>/SKILL.md`，用于扩展你在特定领域的能力。
系统在每次对话时会加载所有技能的 name 与 description；技能的具体内容需你主动查阅。

## 文件结构

```
runtime/
├── skills/
│   ├── skill-1/
│   │   ├── SKILL.md
│   │   └── script.js
│   ├── skill-2/
│   │   ├── SKILL.md
│   │   └── script.js
│   └── ...
└── ...
```

## 文件格式

- **路径**：`skills/<name>/SKILL.md`（相对于 runtime），例如 `skills/weather/SKILL.md`。
- **格式**：顶部 YAML front matter，其后为 Markdown body。

| front matter 字段 | 说明                         |
| ----------------- | ---------------------------- |
| name              | 技能标识，必须与子目录名一致 |
| description       | 简短描述                     |

body 即技能的具体知识、步骤与规范。推荐：用 `##` 分节、`-` 或编号列表写要点，必要时用表格和代码块，关键术语用 **粗体** 强调。

示例：

```markdown
---
name: example
description: A brief description of what this skill does
---

# Example

Instructions for the agent to follow when this skill is activated.

## When to use

Describe when this skill should be used.

## Instructions

1. First step
2. Second step
3. Additional steps as needed
```
