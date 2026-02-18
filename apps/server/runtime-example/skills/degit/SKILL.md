---
name: degit
description: 使用 degit 从 Git 仓库（如 GitHub、GitLab）快速创建项目脚手架。它通过下载最新的 tarball 而不是克隆整个历史记录来工作，速度更快。
---

# Degit

本技能用于通过 `degit` 工具从 Git 仓库高效地创建项目脚手架。

## 何时使用 (When to use)

- 当用户需要基于一个 Git 仓库模板（例如，一个启动器项目）来创建一个新项目时。
- 当用户想要快速拉取一个仓库的最新代码，而不需要完整的 git 历史记录时。

## 使用方法 (Instructions)

`degit` 是一个命令行工具。你应该通过 `[exec]` 工具来调用它。为了避免全局安装的依赖，建议使用 `npx` 来运行。

**基本命令格式**:

```bash
npx degit <source> [<destination>]
```

- `<source>`: 源仓库，格式通常为 `user/repo`。
- `<destination>`: (可选) 目标目录。如果省略，则克隆到当前工作目录。

## 常见用法示例 (Common Usage Examples)

1.  **从 GitHub 克隆到新目录**:

    ```bash
    npx degit sveltejs/template my-svelte-project
    ```

2.  **克隆到当前目录**:

    ```bash
    npx degit sveltejs/template
    ```

3.  **指定分支、标签或 Commit**:
    通过在仓库名后加 `#` 来指定。

    ```bash
    # 克隆特定分支
    npx degit user/repo#dev-branch

    # 克隆特定版本标签
    npx degit user/repo#v2.1.0

    # 克隆特定 commit
    npx degit user/repo#1234abcd
    ```

4.  **从 GitLab 或 BitBucket 克隆**:

    ```bash
    # 从 GitLab 克隆
    npx degit gitlab:user/repo

    # 从 BitBucket 克隆
    npx degit bitbucket:user/repo
    ```

5.  **仅克隆仓库的子目录**:
    ```bash
    npx degit user/repo/subdirectory
    ```

## 注意事项 (Notes)

- **私有仓库**: `degit` 默认通过下载 tarball 的方式工作，这不支持私有仓库。对于私有仓库，必须使用 `git` 模式，这会通过 SSH 调用 `git clone`，速度较慢。
  ```bash
  npx degit user/private-repo --mode=git
  ```
- **无 `.git` 目录**: 与 `git clone` 不同，`degit` 不会复制源仓库的 `.git` 目录。你得到的是一个干净的项目文件副本，可以直接初始化为你自己的新仓库。
