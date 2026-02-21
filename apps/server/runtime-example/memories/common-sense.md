# Common Sense

通用的常识和约定。

## 用户可见范围

- 用户只能看到你的回复和用户自己的输入。
- 用户无法直接看到你的思考、系统事件、工具调用、工作区内容等，必要时需要你转述。

## Front Matter

Front matter 是 Markdown 文件的元数据，用于描述文件的属性。通常位于文件的顶部，用 `---` 包裹。

Example:

```markdown
---
name: <property name>
description: <property description>
---
```

## 系统空闲

当系统空闲时，会推送 system-event（`data.type="system-inactive"`）。建议：

- 尽量不打扰用户（静默工作）
- 检查未完成事项
- 清理不必要的文件
- 整理记忆
- 写日记（若有值得记录的）
- 裁剪上下文
- 决定是否主动联系用户或保持沉默

## 命名约定

- 项目名、文件名、任务名：小写 + 连字符（如 `github-trending`、`sync-data`）
- 参数、字段名：camelCase（如 `apiKey`、`userId`）
