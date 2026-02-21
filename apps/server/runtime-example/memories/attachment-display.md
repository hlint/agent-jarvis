# 使用 attachment 工具展示文件

**文件类资源**（图片、音视频、文档等）应使用 `attachment` 工具展示，**网页型外链**（链接到页面的 URL）推荐在正文中用 `[链接文字](url)` 嵌入。

## 调用顺序

**先调用 attachment 工具，再输出正文。** 若回复中需要附带文件，务必先完成工具调用，再输出说明文字。两者可在同一轮完成：在同一 action 中同时设置 `toolCalls`（含 attachment）和 `outputNext`/`outputDirectly`，系统会先执行工具再输出。不要反过来在正文里描述「见下图」却未先调用工具。

## 区分

- **文件**：本地文件、或指向可直接展示/下载资源的 URL（如图片直链）→ 用 attachment 工具
- **网页链接**：指向文章、站点等页面的 URL → 在回复正文中嵌入，如 `[参考文档](https://...)`

## attachment 工具用法

### 本地文件（local-file）

当需要展示已生成或已存在的本地文件时，调用：

```
attachment(type="local-file", path="...")
```

- **path**：文件路径
  - **相对路径**（不以 `/` 开头）：相对于 runtime 目录，如 `workspace/output/chart.png`
  - **绝对路径**（以 `/` 开头）：系统绝对路径，如 `/tmp/output.svg`
- 文件名和 MIME 类型由系统自动从文件读取

### 远程文件（remote-url）

当需要展示网络上的**直接文件资源**（如图片直链、音视频直链）时，调用：

```
attachment(type="remote-url", url="https://...")
```

注：链接到网页的 URL 不用此工具，在正文中用 `[链接](url)` 即可。

## path 规则（本地文件）

| 类型     | 示例                                              |
| -------- | ------------------------------------------------- |
| 相对路径 | `workspace/foo.png`、`workspace/output/chart.png` |
| 绝对路径 | `/home/alice/photos/photo.png`、`/tmp/output.svg` |

## 示例

- 展示图表并附带说明（同一轮）：`toolCalls` 含 attachment + `outputNext` 或 `outputDirectly`
- 仅展示工作目录下的图表：`attachment(type="local-file", path="workspace/output/chart.png")`
- 展示临时生成的图片：`attachment(type="local-file", path="/tmp/screenshot.png")`
- 展示网络上的图片直链：`attachment(type="remote-url", url="https://example.com/diagram.png")`
- 网页链接仍在正文嵌入：`详见 [官方文档](https://docs.example.com)`

## 注意

- **先工具后正文**：有文件要展示时，先调用 attachment，再输出说明文字；二者可在同一轮并行设置（toolCalls + outputNext/outputDirectly）
- 确保 path 指向的文件存在且可读，否则工具会报错
- 对于小型纯文本内容，仍可直接在回复中展示
- 图片、附件等文件用 attachment 工具；网页链接用正文中的 `[文字](url)` 嵌入
