---
name: cron
description: 如何更好地管理和执行定时任务
whenToReview: 创建或更新任务时推荐review，首次使用定时任务功能时必须review
tips: cron 格式：分 时 日 月 周，如 0 9 * * 1-5 表示每周一至五 9:00，*/15 * * * * 表示每 15 分钟
---

# 定时任务

当用户需要设置提醒、周期执行某类任务（如每日天气、每周汇总），或当系统因定时触发而调用你时，请按本技能执行。

## 可用工具

- **upsert-cron-task**：创建或更新定时任务（按 name 唯一标识）。不存在则创建（必填 name、description、cronPattern）；存在则按需更新。name 仅允许英文字母、数字及符号 - 和 \_（与 SKILL 命名规则一致）。
- **remove-cron-task**：按 name 删除定时任务。需提供任务 name 与 brief。
- **list-cron-tasks**：列出全部定时任务及下次触发时间。需提供 brief。

## Cron 表达式格式

系统使用 **5 个字段**（分 时 日 月 周），从左到右为：

`second minute hour day-of-month month day-of-week`

| 字段         | 取值范围               |
| ------------ | ---------------------- |
| minute       | 0-59                   |
| hour         | 0-23                   |
| day-of-month | 1-31                   |
| month        | 1-12                   |
| day-of-week  | 0-7（0 与 7 均为周日） |

常用写法：`*` 任意值；`1-3,5` 范围与离散值；`*/2` 每 2 单位。

**示例：**

- `0 0 * * *` — 每天 0:00
- `0 9 * * 1-5` — 每周一至五 9:00
- `*/15 * * * *` — 每 15 分钟
- `0 */2 * * *` — 每 2 小时整点
- `0 8 1 * *` — 每月 1 日 8:00
- `0 21 * * 5` — 每周五 21:00

创建/更新后工具会返回下次触发时间，请据此核对表达式是否正确；有误则用 remove 删除后重新 upsert。

## 创建/更新任务时的要点

1. **description 必须自包含**：触发时可能已无当前对话上下文，description 里要写清「做什么、用什么参数、预期结果」，例如明确城市名、接口参数等，使仅凭 description 即可执行。
2. **oneTimeTrigger**：仅需执行一次的提醒用 `oneTimeTrigger: true`，触发后任务会自动删除；周期任务用 `false`。
3. **name**：任务唯一标识，仅允许英文字母、数字及符号 - 和 \_（如 daily-weather、my-reminder）。创建时必填；更新时可用 newName 重命名。

## 被定时触发时的行为

当系统因定时任务触发而调用你时，你会收到一条「工具结果」形态的消息，相当于一次「系统提醒」，其中包含：

- `taskName`、`taskCronPattern`、`oneTimeTrigger`
- **taskDescription**：该任务的完整执行说明

你的职责是：**根据 taskDescription 执行任务**，执行完后是否用自然语言向用户汇报结果或调用其他工具由你自行决定。

## 建议流程

- **用户要新建定时**：确认周期或具体时间 → 写出自包含的 description，定好 name（符合命名规则）→ 调用 upsert-cron-task → 用返回的 nextTriggerTime 确认无误并告知用户。
- **用户要取消/删除**：先 list-cron-tasks 找到对应任务的 name，再 remove-cron-task(name)。
- **用户要查看现有定时**：调用 list-cron-tasks，整理后按「任务名、周期、下次触发时间」等格式回复。
