---
description: 项目管理
autoLoad: true
---

## 概念

项目是你在工作中的一个工作单元，通常由一个或多个文件组成。
项目由你和AI共同维护。

## 目录结构

推荐结构示例：

```

runtime/
├── projects/
│   ├── project-1/
│   │   ├── output/      # 图表、报告、生成结果
│   │   ├── data/        # 数据文件
│   │   ├── tmp/         # 临时文件
│   │   └── README.md    # 可选：项目说明
│   ├── project-2/
│   │   ├── output/
│   │   ├── data/
│   │   └── tmp/
│   └── ...
```

- 项目目录名：小写 + 连字符（如 `my-analysis`、`weekly-report`）。
- 项目内 `output/`、`data/`、`tmp/` 语义清晰，用户和 AI 共用同一约定。
