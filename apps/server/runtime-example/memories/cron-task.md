# Cron Task

此处记录定时任务的约定与用法：任务以**目录**为单位存放在 runtime 的 `cron-tasks/<name>/`，目录下必有 `CRON.md`，系统按 cron 表达式触发并推送 system-event。

## 为何按目录组织

每个任务拥有独立目录，便于**将与任务相关的文件放在同一目录下**（脚本、配置、数据等）。触发时你可根据 body 说明，在任务目录内执行脚本或读取资源。例如：任务需用 Node.js 跑一个脚本，则把脚本放在 `cron-tasks/<name>/script.js`，body 中写明「在 `cron-tasks/<name>/` 下执行 `node script.js`」（可用 [exec] 时指定 cwd 为该目录）。这样任务与资源集中、路径简单、便于维护。

## CRON.md 文件格式

每个定时任务对应目录 `cron-tasks/<name>/CRON.md`（路径相对于 runtime）。文件顶部为 YAML front matter，其后为 Markdown body（触发时作为执行说明交给 AI）。

Front matter 字段：

| 字段        | 说明                                                                               |
| ----------- | ---------------------------------------------------------------------------------- |
| name        | 任务唯一标识，仅允许英文字母、数字及 `-`、`_`（如 `daily-weather`、`my-reminder`） |
| description | 简短描述，用于列表展示                                                             |
| cronPattern | Cron 表达式（见下）                                                                |
| oneTimeOnly | `true` 表示仅执行一次，触发后会自动禁用该任务；`false` 表示周期任务                |
| enabled     | `true` 启用，`false` 禁用（不触发）                                                |

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

1. **获取天气**：用 [web-search] 搜「北京 天气」，或调用天气 API（若已配置）。
2. **格式**：提炼为「北京 | 温度 | 天气 | 湿度」，简洁一行。
3. **通知**：调用 [notify]，将上述格式内容推送给用户。
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

## 创建/更新任务时的要点

1. **body 与 description 要自包含**：触发时可能已无当前对话上下文，body 里要写清「做什么、用什么参数、预期结果」（如城市名、接口参数等），使仅凭 body 即可执行。
2. **任务相关文件放同目录**：脚本、配置等建议放在 `cron-tasks/<name>/` 下；body 中说明执行方式时，写清工作目录与命令（如 `cwd: cron-tasks/<name>`，再执行 `node script.js`）。
3. **oneTimeOnly**：仅需执行一次的提醒用 `oneTimeOnly: true`；周期任务用 `false`。
4. **路径**：创建或编辑时使用基于 runtime 的相对路径，例如 `cron-tasks/daily-weather/CRON.md`（使用 [write-file] 可自动创建目录）。

## 被定时触发时的行为

当系统因定时任务触发而调用你时，会收到一条 system-event（`data` 中含该任务信息），其中：

- `content`：该任务的 **body** 全文，即完整执行说明
- `data`：含 `name`、`cronPattern`、`oneTimeOnly`、`enabled`、`description` 等

你的职责是**根据 content（body）执行任务**，执行完后是否用自然语言向用户汇报或调用其他工具由你自行决定。

## 建议流程

- **用户要新建定时**：确认周期或具体时间 → 写好自包含的 body 与 front matter（name 符合命名规则）→ 用 [write-file] 写入 `cron-tasks/<name>/CRON.md` → 用 [list-cron-tasks] 查看 `nextTriggerTime` 确认并告知用户。
- **用户要取消/禁用**：用 [list-cron-tasks] 找到对应 `name`，再用 [edit-file] 将该任务的 `CRON.md` 中 `enabled` 改为 `false`；或删除 `cron-tasks/<name>/` 下文件（需先 [list-dir] 确认路径）。
- **用户要查看现有定时**：调用 [list-cron-tasks]，按「任务名、周期、下次触发时间」等格式整理回复。
