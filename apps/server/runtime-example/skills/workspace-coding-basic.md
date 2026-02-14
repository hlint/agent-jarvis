---
name: workspace-coding-basic
description: 工作区编程开发基础知识，包括npm包依赖管理、环境变量、运行参数、开发技巧与规范等。
active: false
---

## 基本规则

- 进行npm包的依赖管理前，先用 `workspace-get-info` 检查当前依赖。
- 不要改动`system`目录下的文件，除非你非常确定你正在做什么。
- 优先使用`inline`模式运行一次性脚本，而不是创建文件。

## 推荐npm库(默认预装)

- `es-toolkit`：工具库，提供debounce、throttle、sleep等实用函数。
- `fs-extra`：文件操作库，提供readJSONSync、ensureDirSync等实用函数。
- `zod`：数据验证库。
- `dayjs`：日期处理库。
- `cheerio`：HTML解析库。

## 如何读取环境变量和运行参数

```js
// 示例脚本：演示如何读取环境变量和运行参数
import getRuntimeEnv from "@ws/system/env";
import getRuntimeParams from "@ws/system/params";

// 读取环境变量
const apiKey = getRuntimeEnv("HELLO_WORLD_API_KEY");
console.log(`API Key: ${apiKey ?? "(not set)"}`);

// 读取运行参数
const params = getRuntimeParams();
console.log(`Params: ${JSON.stringify(params)}`);
```

## 代码导入时支持路径别名：`@ws/`

**重要说明**：`@ws/` 路径别名**仅适用于代码中的 import 导入语句**，不能用于文件操作工具（如 `workspace-read-file`、`workspace-write-file`、`workspace-run-script` 的 `path` 参数等）。文件操作必须使用相对路径。

- 何时使用路径别名：当项目需要引用共享的工具代码时，如 `import { fetchData } from "@ws/utils/fetch.js";`
- 何时使用相对路径：当项目内部文件引用时，如 `import { fetchData } from "../lib/fetch.js";`

## 环境变量

- 环境变量会在执行脚本时自动加载，通过`getRuntimeEnv`读取。
- 作为AI，你无法直接访问环境变量文件，但你可以引导用户手动修改它。
- 环境变量适合存储敏感信息，如API密钥、数据库连接字符串等。

## 开发技巧与规范

### 渐进式开发

1. 先实现最小可用版本，只包含核心逻辑，不带复杂依赖。
2. 运行并验证，检查`stdout`、`stderr`、`exitCode`确认无误。
3. 逐步增强，在确认基础逻辑正确后，再添加依赖、参数处理等。

### 错误处理

1. 使用`try-catch`捕获异常，避免因单个错误导致整个脚本崩溃。
2. 对于可选功能，检查环境变量或依赖是否存在再使用。
3. 返回有意义的错误信息到`stderr`，便于调试。

### 文件组织

推荐对于每个独立任务，参考以下目录结构：

```
projects/<project-name>/
  - README.md          # 项目说明（必需）
  - main.js            # 主脚本入口
  - lib/               # 辅助模块（可选）
    - fetch.js
    - parse.js
  - data/              # 数据文件（可选）
    - report-2026-02-10.md
  - tests/             # 测试脚本（可选）
    - test-fetch.js
```

### 文档维护

1. 添加`README.md`，简要说明该目录的用途。
2. 及时更新`README.md`，当目录功能或结构发生变化时同步更新。
