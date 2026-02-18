---
name: skill-creator
description: 创建或更新技能。在需要设计、结构化技能或为技能配备脚本、参考文档、资源文件时使用。
---

# 技能创建

本技能说明如何创建有效技能，并**鼓励将附属文件放在技能目录下**，与 SKILL.md 一起构成完整技能包。

## 技能目录结构

每个技能一个目录，必含 `SKILL.md`，可含以下子目录或文件：

```
skills/<技能名>/
├── SKILL.md          （必选）front matter + 正文说明
├── scripts/          （可选）可执行脚本，供 [exec] 等调用
├── references/       （可选）参考文档，需时用 [read-file] 加载
└── assets/           （可选）模板、图片等，用于产出物，一般不读入上下文
```

- **scripts/**：需要稳定、可重复执行时放脚本（如 Python/Shell）。AI 用 [exec] 在技能目录下执行，避免每次重写相同代码。
- **references/**：篇幅较长或按需查阅的内容（API 文档、表结构、策略说明）。正文中写明「详见 references/xxx.md」，AI 需要时再 [read-file]。
- **assets/**：产出用到的文件（模板、Logo、字体等）。不读入上下文，仅作为写文件、复制时的来源。

原则：**SKILL.md 保持精简**，只写流程与何时用哪些附属文件；细节、大段参考放进 references 或脚本，避免撑爆上下文。

## 命名与格式

- 目录名与技能名一致：小写、数字、连字符（如 `skill-creator`、`pdf-rotate`）。
- SKILL.md 顶部 YAML：`name`、`description` 必填。description 要写清「做什么、何时触发」，供系统匹配。
- 正文用 Markdown，`##` 分节，关键步骤用列表或代码块。

## 创建流程（用文件工具）

1. **明确用途**：技能解决什么问题、在什么场景触发。
2. **规划附属文件**：哪些放 scripts（可执行）、references（按需读）、assets（产出用）。
3. **创建目录与文件**：用 [write-file] 创建 `skills/<name>/SKILL.md`，必要时创建 `scripts/`、`references/`、`assets/` 下文件（如 `scripts/rotate.py`、`references/schema.md`）。
4. **写 SKILL.md**：front matter 的 description 写全「做什么 + 何时用」；正文写流程、何时用脚本/参考/资源，并注明路径（如「执行 `scripts/xxx.js`，cwd 为当前技能目录」）。
5. **迭代**：根据实际使用调整正文与附属文件。

## 不要放的内容

技能目录内只放与执行直接相关的内容。不要新建 README、安装指南、更新日志等额外说明文件。
