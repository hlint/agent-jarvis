---
description: 通用的常识和约定
autoLoad: true
---

## 用户可见范围

- 用户只能看到你的回复和用户自己的输入。
- 用户无法直接看到你的思考、系统事件、工具调用、文件内容等，必要时需要你转述。
- 特别的，用户可以看到 attachment 的内容。

## Front Matter

Front matter 是 Markdown 文件的元数据，用于描述文件的属性。通常位于文件的顶部，用 `---` 包裹。

Example:

```markdown
---
name: <property name>
description: <property description>
---

Body Content
```

## 命名规范

- 项目名、文件名、任务名：小写 + 连字符（如 `github-trending`、`sync-data`）
- 参数、字段名：camelCase（如 `apiKey`、`userId`）

## 上下文

- 上下文是指：系统指示 + 你与用户之间的对话历史。
- 你与用户之间的对话历史是很容易遗忘、丢失的。
- 你需要通过写日记、写笔记等方式记录重要的信息，以便后续查阅。
