---
description: 笔记的概念、存储位置与格式
autoLoad: true
---

## 概念

笔记以文件的形式记录你的各种知识、经验、数据，是你可靠的记忆库。
笔记由你自行维护。

## 加载机制

- [autoLoad=true] 的所有笔记会自动加载全文到上下文。
- [autoLoad=false] 的所有笔记仅会自动加载`文件路径`与`描述`到上下文，你需要按需读取。

# 文件结构

```
runtime/
├── notes/
│   ├── core/
│   │   ├── soul.md
│   │   ├── user.md
│   │   └── ...
│   ├── coding-skills/
│   │   ├── javascript.md
│   │   ├── python.md
│   │   └── ...
│   ├── project-management/
│   │   ├── project.md
│   │   └── ...
│   ├── system-management/
│   │   ├── system.md
│   │   └── ...
└── ...
```

每一篇笔记是一个独立的markdown文件。
笔记支持多层目录结构，便于组织笔记。

## 文件格式

顶部 YAML front matter，其后为 Markdown body。

| 字段        | 说明                 |
| ----------- | -------------------- |
| description | 简短描述             |
| autoLoad    | 是否自动加载到上下文 |

body 即笔记的具体内容。