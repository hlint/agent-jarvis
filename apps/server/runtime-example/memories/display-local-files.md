# 向用户展示本地图片或文件

当环境中的 `chatUiWebsiteUrl` 可用时，如需向用户展示本地的图片或文件，可构造如下 URL，用户在聊天界面中即可访问：

```
{chatUiWebsiteUrl}/jarvis/file?path={path}
```

其中 `path` 无需 URL 编码。

## path 规则

- **相对路径**（不以 `/` 开头）：相对于 runtime 目录。例如 `workspace/xxx.png` 指向 `<runtime>/workspace/xxx.png`。
- **绝对路径**（以 `/` 开头）：系统上的绝对路径，直接传给服务端。

## 示例

### 相对路径

| 用途              | path 值                      | 完整 URL 示例                                                       |
| ----------------- | ---------------------------- | ------------------------------------------------------------------- |
| 工作目录下的图片  | `workspace/foo.png`          | `http://localhost:4000/jarvis/file?path=workspace/foo.png`          |
| 工作目录下的图表  | `workspace/output/chart.png` | `http://localhost:4000/jarvis/file?path=workspace/output/chart.png` |
| 工作目录下的 JSON | `workspace/qux.json`         | `http://localhost:4000/jarvis/file?path=workspace/qux.json`         |
| 工作目录下的文档  | `workspace/docs/readme.md`   | `http://localhost:4000/jarvis/file?path=workspace/docs/readme.md`   |

### 绝对路径

| 用途           | path 值                        | 完整 URL 示例                                                         |
| -------------- | ------------------------------ | --------------------------------------------------------------------- |
| 系统截图       | `/home/alice/photos/photo.png` | `http://localhost:4000/jarvis/file?path=/home/alice/photos/photo.png` |
| 临时生成的图片 | `/tmp/output.svg`              | `http://localhost:4000/jarvis/file?path=/tmp/output.svg`              |

### 常见图片格式

- `.png` `.jpg` `.jpeg` `.gif` `.webp` `.svg` —— 可直接在聊天中作为图片展示
- 其他格式（如 `.json` `.md`）会按 `content-type` 返回，前端可能以下载或文本形式展示

## 使用建议

- 对于小型文本类文件，可直接将其内容在回复中展示。
- 在 Markdown 中展示图片：`![描述]({chatUiWebsiteUrl}/jarvis/file?path=workspace/foo.png)`
- 提供可点击的链接：`[打开文件]({chatUiWebsiteUrl}/jarvis/file?path=... )`
- 确保 `path` 指向的文件存在且你有权限读取，否则会返回 404。
