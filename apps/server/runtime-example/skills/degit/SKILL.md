---
name: degit
description: Use degit to quickly scaffold projects from Git repositories (such as GitHub or GitLab) by downloading the latest tarball instead of cloning the full history.
---

# Degit

This skill explains how to efficiently scaffold a project from a Git repository using the `degit` CLI.

## When to use

- When the user needs to create a new project based on a Git repository template (for example, a starter project).
- When the user wants to quickly pull the latest snapshot of a repository without its full Git history.

## Instructions

`degit` is a command-line tool. You should invoke it through the `[exec]` tool. To avoid relying on globally installed dependencies, it is recommended to run it via `npx`.

**Basic command format**:

```bash
npx degit <source> [<destination>]
```

- `<source>`: The source repository, usually in the form `user/repo`.
- `<destination>`: (Optional) Target directory. If omitted, files are created in the current working directory.

## Common usage examples

1. **Clone from GitHub into a new directory**:

   ```bash
   npx degit sveltejs/template my-svelte-project
   ```

2. **Clone into the current directory**:

   ```bash
   npx degit sveltejs/template
   ```

3. **Specify branch, tag, or commit**:
   Append `#` and the ref to the repository name.

   ```bash
   # Clone a specific branch
   npx degit user/repo#dev-branch

   # Clone a specific version tag
   npx degit user/repo#v2.1.0

   # Clone a specific commit
   npx degit user/repo#1234abcd
   ```

4. **Clone from GitLab or Bitbucket**:

   ```bash
   # Clone from GitLab
   npx degit gitlab:user/repo

   # Clone from Bitbucket
   npx degit bitbucket:user/repo
   ```

5. **Clone only a subdirectory of a repository**:

   ```bash
   npx degit user/repo/subdirectory
   ```

## Notes

- **Private repositories**: By default, `degit` works by downloading a tarball, which does not support private repositories. For private repositories, you must use `git` mode, which calls `git clone` over SSH and is typically slower.

  ```bash
  npx degit user/private-repo --mode=git
  ```

- **No `.git` directory**: Unlike `git clone`, `degit` does not copy the source repository’s `.git` directory. You get a clean copy of the project files that you can initialize as a new repository.
