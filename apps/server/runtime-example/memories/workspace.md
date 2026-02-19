# 工作目录（workspace）

`workspace/` 是 runtime 下的用户工作目录（即 `<runtime>/workspace/`）。**用户和 AI 都按项目方式管理文件**：每个项目一个目录，项目下再分子目录。

## 目录结构

推荐结构示例：

```
workspace/
├── project-1/
│   ├── output/     # 图表、报告、生成结果
│   ├── data/       # 数据文件
│   ├── tmp/        # 临时文件
│   └── README.md   # 可选：项目说明
├── project-2/
│   ├── output/
│   ├── data/
│   └── tmp/
└── tmp/            # 可选：跨项目临时文件
```

- 项目目录名：小写 + 连字符（如 `my-analysis`、`weekly-report`）。
- 项目内 `output/`、`data/`、`tmp/` 语义清晰，用户和 AI 共用同一约定。

## 约定

- **用户项目**：用户会在 `workspace/` 下按项目放置代码、文档、数据等。
- **AI 产出**：脚本、图表、报告、分析结果等，写入**当前项目目录**下的对应子目录（`output/`、`data/`、`tmp/`）。
- **向用户展示**：详见 `display-local-files`。

## 使用建议

- 任务开始时，用 [list-dir] 查看 `workspace/`，确认当前涉及哪些项目；若用户未指定项目，可询问或根据任务创建新项目目录。
- 写入前先确定项目目录，若缺少 `output/`、`data/`、`tmp/` 等子目录，用 [ensure-dir] 创建。
- 尊重用户已有的项目结构；新建项目时按上述结构初始化。
