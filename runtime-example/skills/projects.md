---
name: projects
description: 指导 AI 完成复杂的多步骤项目任务，如定期数据抓取、自动化工作流、数据处理管道等。涵盖从需求分析、方案设计、用户审核、工作区实现、测试优化、文档维护到定时任务设置的完整流程。
---

# 复杂项目任务执行指南

当用户提出复杂的、需要多个步骤协作的任务时，请遵循本指南系统化地完成。

## 什么是复杂项目任务

典型特征：

- 需要编写自定义代码或脚本
- 涉及外部数据源或 API 交互
- 需要定期执行或长期维护
- 包含多个相互依赖的步骤
- 需要数据存储、处理或转换

**示例**：

- 每日抓取某网站数据，汇总后定时发送报告
- 定期监控 API 状态并在异常时通知
- 自动化数据处理管道：下载 → 清洗 → 分析 → 输出
- 周期性同步多个数据源并生成仪表板

## 标准执行流程

### 第 1 步：需求分析与计划制定

使用 `think` 工具分析任务：

- **输入**：用户描述的任务需求
- **输出**：结构化分析，包括：
  - 核心目标（做什么）
  - 关键步骤（怎么做）
  - 所需资源（依赖包、环境变量、外部服务）
  - 潜在难点和风险
  - 测试验证方式

**制定实施计划**，包括：

1. 项目目录结构（在 `projects/` 下创建子目录）
2. 需要编写的脚本及其职责
3. 需要安装的依赖包
4. 需要的环境变量（提醒用户手动设置）
5. 测试方案
6. 定时任务设置（如需要）

### 第 2 步：用户审核与确认

**向用户展示计划**，包括：

- 项目目录结构示意
- 主要脚本的功能说明
- 需要安装的依赖包列表
- 需要用户手动配置的内容（如 API 密钥）
- 预计的测试步骤

**等待用户确认或调整**后再进入实施阶段。

### 第 3 步：工作区准备

1. **创建项目目录**：

   ```
   workspace_write_file(files: [{
     path: "projects/<project-name>/README.md",
     content: "项目说明..."
   }])
   ```

2. **安装依赖**（如需要）：

   ```
   workspace_manage_deps(add: ["axios", "cheerio", ...])
   ```

3. **检查环境变量**：
   ```
   workspace_get_info()
   ```
   若缺少必需的环境变量，提醒用户手动添加到 `.env`。

### 第 4 步：编写与测试核心逻辑

**MVP 原则**：先实现最小可用版本

1. **编写核心脚本**（只包含主要功能，暂不考虑边界情况）：

   ```
   workspace_write_file(files: [{
     path: "projects/<project-name>/main.js",
     content: "核心逻辑代码..."
   }])
   ```

2. **运行并验证**：

   ```
   workspace_run_script(path: "projects/<project-name>/main.js")
   ```

3. **检查输出**：
   - 查看 `stdout` 确认逻辑正确
   - 查看 `stderr` 排查错误
   - 分析 `exitCode` 判断执行状态

4. **让用户确认效果**：展示输出结果，询问是否符合预期。

### 第 5 步：优化与完善

用户确认基础功能正确后，进行优化：

1. **代码优化**：
   - 添加错误处理（`try-catch`）
   - 提取可复用函数
   - 添加清晰的注释
   - 改善日志输出

2. **数据持久化**（如需要）：
   - 创建 `projects/<project-name>/data/` 目录存放结果
   - 编写读写数据的辅助函数
   - 考虑数据格式（JSON、CSV 等）

3. **功能增强**：
   - 添加命令行参数支持（用 `utils/args.js`）
   - 支持配置文件
   - 添加运行日志

### 第 6 步：文档维护

**更新项目 README.md**，包含：

- **项目目标**：简述任务是什么
- **当前状态**：已完成的功能、已知问题
- **如何运行**：
  - 运行命令示例
  - 必需的环境变量
  - 可选的命令行参数
- **输出说明**：脚本会产生什么结果、数据存在哪里
- **维护记录**：重要修改的时间和原因

**示例 README.md**：

```markdown
# GitHub Trending 数据抓取

## 项目目标

每日抓取 GitHub Trending 项目列表，汇总生成 Markdown 报告并通过邮件发送。

## 当前状态

- ✅ 抓取逻辑已完成
- ✅ 数据解析和格式化
- ✅ 报告生成
- 🔄 邮件发送待集成

## 如何运行

\`\`\`bash

# 手动运行（抓取并生成报告）

workspace_run_script(path: "projects/github-trending/main.js")

# 指定语言

workspace_run_script(path: "projects/github-trending/main.js", args: ["--lang", "typescript"])
\`\`\`

## 环境变量

- `GITHUB_TOKEN`（可选）- GitHub API 令牌，提高请求限额

## 输出

- 报告保存在 `projects/github-trending/data/report-YYYY-MM-DD.md`
- 控制台输出抓取的项目数量
```

### 第 7 步：设置定时任务（如需要）

如果任务需要定期执行：

```
upsert-cron-task({
  name: "github-trending-daily",
  description: "每日早上 8 点运行 projects/github-trending/main.js 抓取 GitHub Trending 数据，生成报告并通过 notify 工具发送通知。",
  cronPattern: "0 8 * * *",
  oneTimeTrigger: false
})
```

**定时任务 description 要点**：

- 明确脚本路径：`projects/<project-name>/main.js`
- 说明执行内容：抓取什么、处理什么、输出什么
- 包含后续动作：如「生成报告后调用 notify 发送通知」

## 完整案例：GitHub Trending 每日报告

**用户需求**：

> 我想每天早上 8 点自动抓取 GitHub Trending TypeScript 项目，生成一份 Markdown 报告，发送到我手机。

**执行流程**：

### 1. 分析与计划（使用 think）

```
目标：定期抓取 GitHub Trending 并发送报告
步骤：
1. 创建项目目录 projects/github-trending
2. 安装依赖：cheerio（解析 HTML）、dayjs（日期处理）
3. 编写 main.js：抓取 → 解析 → 生成报告 → 保存到 data/
4. 测试脚本
5. 创建定时任务：每日 8:00 运行脚本 + notify 发送通知
6. 完善文档

环境变量：GITHUB_TOKEN（可选，提高限额）
风险：网站结构变化、网络超时
```

### 2. 向用户展示计划

```
我计划这样实现：

目录结构：
projects/github-trending/
  - main.js（核心脚本）
  - data/（存放报告）
  - README.md（项目说明）

需要安装：cheerio、dayjs

需要你手动配置（可选）：
- .env 中添加 GITHUB_TOKEN=你的token（提高请求限额）

测试方式：先手动运行一次，确认能抓取并生成报告，再设置定时任务。

是否同意？有需要调整的吗？
```

### 3. 工作区准备

```javascript
// 安装依赖
workspace_manage_deps({ add: ["cheerio", "dayjs"] });

// 创建项目 README
workspace_write_file({
  files: [
    {
      path: "projects/github-trending/README.md",
      content:
        "# GitHub Trending 数据抓取\n\n每日抓取 GitHub Trending TypeScript 项目...",
    },
  ],
});
```

### 4. 编写核心脚本

```javascript
workspace_write_file({
  files: [
    {
      path: "projects/github-trending/main.js",
      content: `
import { getEnv } from "../../utils/env.js";
import { getFlagValue } from "../../utils/args.js";

const lang = getFlagValue("--lang", "typescript");
console.log(\`Fetching GitHub Trending for \${lang}...\`);

// 抓取逻辑
const url = \`https://github.com/trending/\${lang}?since=daily\`;
// ... 抓取和解析代码 ...

console.log("Done!");
`,
    },
  ],
});

// 运行测试
workspace_run_script({ path: "projects/github-trending/main.js" });
```

### 5. 用户确认 → 优化

根据用户反馈优化代码：

- 添加错误处理
- 改善输出格式
- 添加数据保存逻辑
- 完善注释

### 6. 更新文档

```javascript
workspace_write_file({
  files: [
    {
      path: "projects/github-trending/README.md",
      content: `
# GitHub Trending 数据抓取

## 项目目标
每日抓取 GitHub Trending TypeScript 项目，生成报告并通知用户。

## 当前状态
- ✅ 抓取和解析已完成
- ✅ 报告生成和保存
- ✅ 定时任务已设置

## 如何运行
workspace_run_script(path: "projects/github-trending/main.js")
workspace_run_script(path: "projects/github-trending/main.js", args: ["--lang", "javascript"])

## 环境变量
GITHUB_TOKEN（可选）- 提高 API 限额

## 输出
- 报告：projects/github-trending/data/report-YYYY-MM-DD.md
- 控制台：项目数量
`,
    },
  ],
});
```

### 7. 设置定时任务

```javascript
upsert_cron_task({
  name: "github-trending-daily",
  description:
    "每日 8:00 运行 projects/github-trending/main.js 抓取 GitHub Trending TypeScript 项目，生成报告保存到 data/ 目录，然后调用 notify 工具发送「GitHub Trending 报告已生成」通知。",
  cronPattern: "0 8 * * *",
  oneTimeTrigger: false,
});
```

## 关键原则

### 增量实现，持续验证

- **不要一次性写完所有代码**：先实现核心功能，运行验证，再逐步添加
- **每个阶段都让用户确认**：基础逻辑 OK → 数据格式 OK → 完整流程 OK
- **保留测试脚本**：即使最终会整合，中间测试脚本也可以保留在 `tests/` 下

### 清晰的项目结构

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

### 定时任务的 description 规范

**必须包含**：

1. **脚本路径**：完整的相对路径，如 `projects/github-trending/main.js`
2. **执行内容**：做什么（抓取、处理、生成）
3. **后续动作**：结果如何使用（保存、通知、触发其他任务）

**示例**：

```
运行 projects/data-sync/sync.js 同步外部 API 数据到工作区 data/ 目录，
完成后调用 notify 发送「数据同步完成，共更新 X 条记录」通知。
```

### 错误恢复与日志

- **脚本中添加错误处理**：`try-catch` + 输出到 `stderr`
- **定时任务失败时**：在 description 中说明「若失败，检查 stderr 并尝试手动运行脚本排查」
- **考虑幂等性**：脚本多次运行应该安全（不重复处理、不覆盖重要数据）

### 文档先行，代码跟上

- **项目 README.md 在第一时间创建**，即使内容简单
- **边实现边更新**：完成一个功能就更新一次 README
- **最终 README 包含**：目标、状态、运行方式、环境变量、输出说明、维护记录

## 工具使用清单

| 阶段     | 使用的工具                               |
| -------- | ---------------------------------------- |
| 需求分析 | `think`                                  |
| 创建目录 | `workspace_write_file`（创建 README.md） |
| 安装依赖 | `workspace_manage_deps`                  |
| 编写代码 | `workspace_write_file`                   |
| 运行测试 | `workspace_run_script`                   |
| 查看结构 | `workspace_list_dir`                     |
| 读取文件 | `workspace_read_file`                    |
| 优化迭代 | `workspace_write_file`（更新代码）       |
| 更新文档 | `workspace_write_file`（更新 README）    |
| 定时执行 | `upsert_cron_task`                       |
| 发送通知 | `notify`（在脚本中或定时任务后）         |

## 注意事项

- **复杂项目必须先 review workspace skill**：确保理解工作区的能力和限制
- **项目隔离**：每个项目使用独立的子目录（`projects/<name>/`），避免文件混乱
- **命名规范**：项目名、脚本名使用小写加连字符（如 `github-trending`、`sync-data`）
- **定时任务命名**：与项目名相关，如 `github-trending-daily`、`data-sync-hourly`
- **依赖管理**：所有项目共享工作区的 `package.json`，安装依赖时考虑版本兼容
- **清理机制**：完成的一次性项目或废弃项目及时删除，保持工作区整洁
