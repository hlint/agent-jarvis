---
description: 已安装软件的列表与维护方式
autoLoad: true
---

此处记录系统中已安装的软件和工具，便于在需要时快速了解可用资源。

## 如何维护此文档

### 何时更新

- **安装新软件后**：使用新工具或发现系统中有新软件时，应更新此列表。
- **遇到问题时**：当需要确认某软件是否可用时，检查后更新文档。

### 如何检查软件

使用 `which` 或 `command -v` 检查命令是否存在；大部分软件都支持使用 `--version` 或 `-v` 获取版本信息：

示例：

```bash
which python && python --version
which node && node --version
which bun && bun --version
which tmux && tmux -V
```

## 已安装软件

### 运行时环境

- **python**：Python 解释器
- **nodejs**：Node.js 运行时
- **bun**：Bun 运行时和包管理器

### 开发工具

- **tmux**：终端复用器，用于管理长时间运行的交互式命令

### 其他工具

- **agent-browser**：浏览器自动化工具

## 注意事项

- 此列表仅记录**系统级**安装的软件，不包括项目依赖（如 npm/bun 包）。
- 若某软件通过包管理器安装但不在 PATH 中，应注明安装位置。
- 若软件版本对任务有影响，应记录具体版本号。
