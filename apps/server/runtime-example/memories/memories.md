# Memories

此处记录记忆的约定与用法：记忆以 Markdown 文件形式存放在 runtime 的 `memories/` 目录下，**所有 `.md` 文件会被自动加载到上下文**，作为长期记忆。未在此目录中的信息可能随对话压缩或上下文轮替而被遗忘。

## 存储位置与格式

- **路径**：`memories/` 下的 `.md` 文件（相对于 runtime），例如 `memories/common-sense.md`、`memories/user-prefs.md`。
- **加载方式**：系统会读取该目录下全部 `.md` 文件，按文件名排序后拼接，注入到 AI 上下文。
- **组织建议**：按类别分文件存储（如 `common-sense.md`、`cron-task.md`、`user-prefs.md`），便于查找和更新。

## 如何更新记忆

使用 file 工具自行管理 `memories/` 下的内容：

- 新建记忆：用 [write-file] 写入 `memories/<topic>.md`
- 更新已有记忆：用 [read-file] 读取后，[edit-file] 或 [write-file] 修改
- 查看目录：用 [list-dir] 列出 `memories/` 下的文件

## 何时更新记忆

建议更新记忆的场景：

- 用户明确更新个人信息（姓名、偏好、设置等）
- 用户的偏好或习惯
- 可推测出的、用户希望长期保留的信息
- 发现记忆中信息已过时或错误
- 需要记录重要的、长远的约定

## 小技巧

- 与用户初次交流或闲聊时，可有意识地提问并引导用户补充这些信息
- 对不确定是否长期有效的约定，可询问用户是否需要记住
