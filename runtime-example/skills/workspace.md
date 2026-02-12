---
name: workspace
description: 工作区为 AI 的代码和数据操作空间，具备文件系统、脚本运行、npm 依赖管理能力。已知文件的读取、稳定脚本的运行可直接用工具；创建脚本、目录结构、管理依赖、调试等复杂操作须先 review 本 skill。临时或测试文件请放在 `temp-tasks/` 并及时清理，长期文件须经充分审查后确定存放位置。
---

# 工作区

工作区是 AI 可自由操作的文件系统区域，用于存放代码、脚本、数据文件等。所有文件操作、脚本执行、依赖管理均在此进行。

## 路径约定

**所有路径均相对于工作区根目录**。例如：

- `hello.js` → 工作区根目录下的 `hello.js`
- `utils/helper.js` → 工作区下的 `utils/helper.js`
- `.` 或 `""`（列目录时）→ 工作区根目录

**受保护文件**：工作区的 `.env` 文件受保护，无法直接读写（用于存放 API 密钥等敏感信息）。脚本运行时可通过 `process.env` 读取环境变量。使用 `workspace_get_info` 可查看环境变量的 key（value 被打码）。

## 可用工具

### 文件操作

- **workspace_list_dir**：列出目录内容。
  - 参数：`path`（目录路径，默认 `.`）、`level`（深度 1-3，默认 1）
  - 返回：`{ listEntries, readmeContent }`，listEntries 含每项的 path、type、size/childrenCount

- **workspace_read_file**：读取文件内容。
  - 参数：`paths`（路径数组，如 `['a.js', 'data.json']`）
  - 返回：数组，每项为 `{ path, content }` 或 `{ path, error }`

- **workspace_write_file**：写入文件（覆盖或新建）。
  - 参数：`files`（`{ path, content }` 数组）
  - 返回：数组，每项为 `{ path, success }` 或 `{ path, error }`

- **workspace_delete_file**：删除文件或目录（递归删除）。
  - 参数：`paths`（路径数组）
  - 返回：数组，每项为 `{ path, success }` 或 `{ path, error }`

### 脚本执行

- **workspace_run_script**：使用 Bun 运行 JavaScript 文件。
  - 参数：`path`（脚本路径）、`args`（可选，命令行参数数组）
  - 脚本可通过 `process.env` 读取环境变量，通过 `process.argv` 读取命令行参数
  - 返回：`{ stdout, stderr, exitCode, success }`，超时会带 `exitedDueToTimeout`

**示例**：工作区有 `hello_world.js`，内容为：

```javascript
// 示例脚本：演示如何读取环境变量和命令行参数
import { getArgs, getFlagValue, hasFlag } from "./utils/args.js";
import { getEnv } from "./utils/env.js";

// 读取环境变量
const apiKey = getEnv("HELLO_WORLD_API_KEY");
console.log(`API Key: ${apiKey ?? "(not set)"}`);

// 读取命令行参数
const args = getArgs();
console.log(`Arguments: ${args.length > 0 ? args.join(", ") : "(none)"}`);

// 示例：根据参数执行不同逻辑
if (hasFlag("--greet")) {
  const name = getFlagValue("--greet");
  console.log(`Hello, ${name ?? "World"}!`);
}
```

**运行示例 1**（无参数）：

```
workspace_run_script(path: "hello_world.js")
```

预期输出：

```
stdout: "API Key: 1234567890\nArguments: (none)\n"
exitCode: 0
success: true
```

**运行示例 2**（带参数）：

```
workspace_run_script(path: "hello_world.js", args: ["--greet", "Alice"])
```

预期输出：

```
stdout: "API Key: 1234567890\nArguments: --greet, Alice\nHello, Alice!\n"
exitCode: 0
success: true
```

### 依赖管理

- **workspace_manage_deps**：添加或删除 npm 包。
  - 参数：`add`（包名数组，可指定版本如 `axios@1.0.0`）、`remove`（包名数组）
  - 使用 `bun add` 和 `bun rm` 修改 `package.json`
  - 返回：`{ added, removed, stdout, stderr, success }`

- **workspace_get_info**：查看工作区信息。
  - 无需参数
  - 返回已安装的 npm 包（含版本）和环境变量 key 列表（value 打码为 `*****`）

**示例输出**：

```
## Dependencies

axios: ^1.6.0
lodash: ^4.17.21

## Environment Variables

HELLO_WORLD_API_KEY=*****
DATABASE_URL=*****
```

## 常见工作流程

### 1. 探索工作区

```
1. workspace_list_dir(path: ".") 查看根目录
2. workspace_get_info() 查看已安装包和环境变量
3. workspace_read_file(paths: ["README.md"]) 读取说明文件
```

### 2. 创建并运行脚本

```
1. workspace_write_file(files: [{ path: "script.js", content: "..." }])
2. workspace_run_script(path: "script.js", args: ["arg1", "arg2"])
```

### 3. 添加依赖并使用

```
1. workspace_manage_deps(add: ["axios"])
2. workspace_write_file(files: [{ path: "fetch.js", content: "import axios from 'axios'; ..." }])
3. workspace_run_script(path: "fetch.js")
```

### 4. 批量操作

```
1. workspace_read_file(paths: ["a.js", "b.js", "c.js"]) 批量读取
2. （处理内容）
3. workspace_write_file(files: [{ path: "a.js", content: "..." }, ...]) 批量写回
```

## 注意事项

- **环境变量**：脚本通过 `process.env.VARIABLE_NAME` 访问，无法直接修改 `.env` 文件（受保护）
- **超时限制**：脚本运行有时长限制（通常 20-30 秒），长时间运行会被终止
- **输出限制**：stdout/stderr 有大小限制（约 2MB），超出会终止进程
- **路径安全**：所有路径自动限制在工作区内，无法访问工作区外的文件

## 最佳实践

### 开始前：先探索

- 使用 `workspace_get_info()` 查看已安装的包和可用的环境变量 key
- 使用 `workspace_list_dir(path: ".")` 了解工作区现有文件结构
- 检查是否已有相关脚本或工具函数可复用

### 编写脚本：复用工具函数

- **推荐**：使用 `utils/env.js` 和 `utils/args.js` 中的工具函数
  ```javascript
  import { getEnv, requireEnv } from "./utils/env.js";
  import { getArgs, hasFlag, getFlagValue } from "./utils/args.js";
  ```
- **避免**：直接使用 `process.env.XXX || default` 和 `process.argv.slice(2)`
- **原因**：工具函数提供一致的接口、更好的错误处理、更易维护

### 依赖管理：先查后装

- 执行 `workspace_get_info()` 检查依赖是否已安装
- 仅在需要时添加新依赖：`workspace_manage_deps(add: ["package-name"])`
- 避免重复安装已有的包

### 脚本执行：渐进式测试

1. **先写简单版本**：只包含核心逻辑，不带复杂依赖
2. **运行并验证**：检查 `stdout`、`stderr`、`exitCode` 确认无误
3. **逐步增强**：在确认基础逻辑正确后，再添加依赖、参数处理等

### 错误处理：优雅降级

- 脚本中使用 `try-catch` 捕获异常，避免因单个错误导致整个脚本崩溃
- 对于可选功能，检查环境变量或依赖是否存在再使用
- 返回有意义的错误信息到 `stderr`，便于调试

### 文件组织：清晰的结构

- **工具函数**：放在 `utils/` 目录下，按功能分模块（如 `args.js`、`env.js`）
- **脚本**：根目录或按功能分目录（如 `scripts/`、`tasks/`）
- **数据文件**：单独目录存放（如 `data/`、`temp/`）
- **及时清理**：任务完成后删除不再需要的临时文件

### 文档维护：添加 README.md

- **强烈建议**：在每个重要目录（如 `scripts/`、`utils/`、`data/`）下创建 `README.md`
- **内容要求**：不需要很长，简要说明该目录的用途即可（2-5 句话）
- **及时更新**：当目录功能或结构发生变化时，同步更新 README.md
- **便于追溯**：`workspace_list_dir` 会自动读取 README.md 内容，帮助你快速理解目录用途，避免遗忘或混淆
- **示例**：

  ```markdown
  # Scripts

  本目录存放数据处理和定时任务相关的脚本。

  - `process_data.js` - 处理用户数据并生成报告
  - `sync_api.js` - 每日同步外部 API 数据
  ```

### 环境变量：安全使用

- **敏感信息**（API 密钥、数据库 URL）：通过 `.env` 管理，用 `getEnv()` 或 `requireEnv()` 读取
- **非敏感配置**：可硬编码或通过命令行参数传入
- **检查可用性**：脚本开始时使用 `workspace_get_info()` 确认所需环境变量已设置（key 可见，value 打码）

### 调试技巧

- **输出中间结果**：在脚本关键步骤添加 `console.log`，便于追踪执行流程
- **分段测试**：将复杂逻辑拆分为多个小脚本，分别测试后再整合
- **保留测试脚本**：工作区允许存放多个脚本，保留测试用例便于后续验证
