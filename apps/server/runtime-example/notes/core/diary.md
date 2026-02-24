---
description: 日记的概念、存储位置与格式
autoLoad: true
---

## 概念

日记记录了你近期做了什么、学了什么、想了什么。
日记的每个条目应当保持简洁，甚至一句话即可。
日记是你的中期记忆，由你自行维护。
系统会将最近 3 天的日记内容自动加载到上下文，用于衔接之前的进展。
如有需要，你可用自行查看更多日记。
写日记时，应当仅追加不覆盖。

# 文件结构

```
runtime/
├── diaries/
│   ├── 2026/
│   │   ├── 02/
│   │   │   ├── 17.md
│   │   │   └── 18.md
│   │   └── ...
└── ...
```

**路径**：`diaries/YYYY/MM/DD.md`，月、日两位补零，例如 `diaries/2026/02/17.md`。

## 日记格式

- **单条格式**：每条占一行，格式为 `**Weekday, Month DD, YYYY HH:MM:** 内容`（与系统 当前时间格式一致，如 `**Friday, February 17, 2026 21:35:** 内容`）。条与条之间空一行。

示例：

```
**Friday, January 01, 2026 01:00:** User introduced himself as John Doe.

**Friday, January 01, 2026 22:00:** User asked me to help him with his project.

```
