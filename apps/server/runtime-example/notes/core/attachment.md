---
description: 使用 attachment 工具展示文件或外链
autoLoad: true
---

## 何时使用

- **文件**：本地文件、或指向可直接展示/下载资源的 URL（如图片直链）→ 用 attachment 工具
- **网页链接**：指向文章、站点等页面的 URL → 在回复正文中嵌入，如 `[参考文档](https://...)`

## attachment 工具用法

### 本地文件（local-file）

当需要展示已生成或已存在的本地文件时，调用：

```
attachment(type="local-file", path="...")
```

- **path**：文件路径
  - **相对路径**（不以 `/` 开头）：相对于 runtime 目录，如 `projects/my-project/output/chart.png`
  - **绝对路径**（以 `/` 开头）：系统绝对路径，如 `/tmp/output.svg`

### 远程文件（remote-url）

当需要展示网络上的**直接文件资源**（如图片直链、音视频直链）时，调用：

```
attachment(type="remote-url", url="https://...")
```

注：链接到网页的 URL 不用此工具，在正文中用 `[链接](url)` 即可。

## 示例

- 展示图表并附带说明：`toolCalls` 含 attachment，可与 `outputNext`/`outputDirectly` 同时设置
- 展示项目中的图表：`attachment(type="local-file", path="projects/my-project/output/chart.png")`
- 展示临时生成的图片：`attachment(type="local-file", path="/tmp/screenshot.png")`
- 展示网络上的图片直链：`attachment(type="remote-url", url="https://example.com/diagram.png")`
- 网页链接仍在正文嵌入：`详见 [官方文档](https://docs.example.com)`

## 注意

- **禁止在正文嵌入本地文件**：不可在回复正文中使用 `![](path)` 或 `![alt](path)` 等方式嵌入本地文件路径。本地文件必须通过 attachment 工具展示，正文中只可出现 attachment 展示后的引用或 remote-url。
- 对于小型纯文本内容，仍可直接在回复中展示
