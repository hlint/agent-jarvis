---
description: 定时任务的数据结构、运行方式
autoLoad: true
---

## 概念

定时任务是系统按照预设时间自动执行的任务。
你可以通过维护 CRON.md 文件来定义定时任务。
定时任务并不会自动加载到上下文，你需要按需读取相关信息。
当系统按照 cron 表达式触发某任务时，会唤醒你并传递任务信息（CRON.md 全文）。

## 文件结构

每个任务拥有独立目录，便于**将与任务相关的文件放在同一目录下**（脚本、配置、数据等）。
触发时你可根据 文档说明，在任务目录内执行脚本或读取资源。
例如：任务需用 Node.js 跑一个脚本，则把脚本放在 `cron-tasks/<name>/script.js`，body 中写明「在 `cron-tasks/<name>/` 下执行 `node script.js`」。这样任务与资源集中、路径简单、便于维护。

```
runtime/
├── cron-tasks/
│   ├── task-1/
│   │   ├── CRON.md
│   │   └── script.js
│   ├── task-2/
│   │   ├── CRON.md
│   │   └── script.js
│   └── ...
└── ...
```

## CRON.md 文件格式

每个定时任务对应文件 `cron-tasks/<name>/CRON.md`。文件顶部为 YAML front matter，其后为 Markdown body（触发时作为执行说明交给你）。

Front matter 字段：

| 字段        | 说明                                                                |
| ----------- | ------------------------------------------------------------------- |
| description | 简短描述，用于列表展示                                              |
| cronPattern | Cron 表达式（见下）                                                 |
| oneTimeOnly | `true` 表示仅执行一次，触发后会自动禁用该任务；`false` 表示周期任务 |
| enabled     | `true` 启用，`false` 禁用（不触发）                                 |

body 即定时任务的执行说明。

示例（参见 `cron-tasks/example/CRON.md`）：

```markdown
---
name: daily-weather
description: 每日 8 点发送北京天气
cronPattern: 0 8 * * *
enabled: true
oneTimeOnly: false
---

# 每日天气

1. **获取天气**：获取北京天气。
2. **格式**：提炼为「北京 | 温度 | 天气 | 湿度」，简洁一行。
3. **通知**：将内容发送给用户。
```

## Cron 表达式（5 字段）

格式：`minute hour day-of-month month day-of-week`

| 字段         | 取值范围               |
| ------------ | ---------------------- |
| minute       | 0-59                   |
| hour         | 0-23                   |
| day-of-month | 1-31                   |
| month        | 1-12                   |
| day-of-week  | 0-7（0 与 7 均为周日） |

常用写法：`*` 任意；`1-3,5` 范围与离散；`*/2` 每 2 单位。

示例：`0 0 * * *` 每天 0:00；`0 9 * * 1-5` 每周一至五 9:00；`*/15 * * * *` 每 15 分钟；`0 8 1 * *` 每月 1 日 8:00。

## 建议

- 当你改动定时任务后，调用 工具[list-cron-tasks]，以确认下次触发时间符合预期。
