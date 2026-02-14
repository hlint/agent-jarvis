---
name: projects
description: 如何更好地完成复杂项目任务，如定期数据抓取、自动化工作流、数据处理管道等。包含一个完整的案例：用户想抓取 GitHub Trending 并每日报告。
active: false
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

## 完整案例：用户想抓取 GitHub Trending 并每日报告

**用户需求**：

> 我想每天早上 8 点自动抓取 GitHub Trending TypeScript 项目，生成一份 Markdown 报告，发送到我手机。

**执行流程**：

### 1. 分析与计划

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

需要的npm包：cheerio、dayjs

需要你手动配置（可选）：
- .env 中添加 GITHUB_TOKEN=你的token（提高请求限额）

测试方式：先手动运行一次，确认能抓取并生成报告，再设置定时任务。

是否同意？有需要调整的吗？
```

### 3. 工作区准备

```javascript
// tool: workspace-manage-deps
{ add: ["cheerio", "dayjs"] }

// tool: workspace-write-file
{
  files: [
    {
      path: "projects/github-trending/README.md",
      content: "# GitHub Trending 数据抓取\n\n每日抓取 GitHub Trending TypeScript 项目...",
    },
  ],
}
```

### 4. 编写核心脚本

```javascript
// tool: workspace-write-file
{
  files: [
    {
      path: "projects/github-trending/main.js",
      content: `
import getRuntimeEnv from "@ws/system/env";
import getRuntimeParams from "@ws/system/params";

const params = getRuntimeParams();
const lang = params.lang ?? "typescript";
console.log(\`Fetching GitHub Trending for \${lang}...\`);

// 抓取逻辑
const url = \`https://github.com/trending/\${lang}?since=daily\`;
// ... 抓取和解析代码 ...

console.log("Done!");
`,
    },
  ],
}

// tool: workspace-run-script
{ path: "projects/github-trending/main.js" }
```

### 5. 用户确认 → 优化

根据用户反馈优化代码：

- 添加错误处理
- 改善输出格式
- 添加数据保存逻辑
- 完善注释

### 6. 更新文档

```javascript
// tool: workspace-write-file
{
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
// tool: workspace-run-script
{ path: "projects/github-trending/main.js" }
// tool: workspace-run-script
{ path: "projects/github-trending/main.js", params: { lang: "javascript" } }

## 环境变量
GITHUB_TOKEN（可选）- 提高 API 限额

## 输出
- 报告：projects/github-trending/data/report-YYYY-MM-DD.md
- 控制台：项目数量
`,
    },
  ],
}
```

### 7. 设置定时任务

```javascript
// tool: upsert-cron-task
{
  name: "github-trending-daily",
  description:
    "每日 8:00 运行 projects/github-trending/main.js 抓取 GitHub Trending TypeScript 项目，获取生成的报告文件的内容，然后调用 notify 工具发送「GitHub Trending 报告已生成」通知。",
  cronPattern: "0 8 * * *",
  oneTimeTrigger: false,
}
```

## 关键原则

- 增量实现，持续验证
- 良好的项目结构
- 错误恢复与日志
- 文档先行，代码跟上
- 定时清理不再需要的文件
