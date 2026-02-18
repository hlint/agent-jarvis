# Context Compress

此处记录如何更好地使用系统工具 `context-compress`。

## 何时执行上下文压缩

在以下情况应主动调用：

- **系统空闲时**：收到系统事件 `data.type="system-inactive"` 时（先做其他整理，如更新记忆、日记等）。
- **上下文接近上限时**：若你感知到对话轮次很多、历史很长，或后续需要大量思考/工具调用，为避免超出模型上下文限制，应提前压缩。
- **任务阶段切换时**：一个完整子任务已结束（例如用户已确认、某功能已实现），新话题或新任务即将开始时，适合压缩旧对话，只保留结论和必要背景。

不要为「刚聊几句」的短对话做压缩；也不要在一轮思考或工具链执行到一半时压缩。

## 保留哪些消息（keepEntryIds）

原则：**只保留对后续对话和决策仍然必要的那几条**。

建议优先保留：

1. **最近一条用户消息和AI的一条回复**：当前轮次的用户输入和AI的回复，必须保留。
2. **最近的、能代表「当前在做什么」的几条**：例如最近一次用户提问、你的一条回复或关键 system-event（如「Context compressed」），避免断档。
3. **若存在上一次压缩产生的 system-event**：保留该条（`data.type="context-compressed"`），其 `content` 即之前对话的摘要，是唯一可追溯的「被删内容」。
4. **与当前任务强相关的少量历史**：例如用户明确提到的需求、关键决策、错误信息等，按需保留 1～3 条即可。

不必保留：

- 早期的寒暄、已完成的子任务细节、大量重复的 thinking/tool-call 中间步骤。
- 若某条已被更晚的 summary 覆盖，可只保留 summary 那条，不保留被概括的原文。

传入的 `keepEntryIds` 必须是当前 `dialogHistory` 里真实存在的 entry 的 `id`；不存在的 id 会被忽略，不会报错。

## Summary 写什么

`summary` 会作为本次压缩的 system-event 的 `content` 写入历史，成为「被删除内容」的唯一替代。应做到：

- **用时间线格式**：按时间顺序写，每条两行：第一行用二级标题写时间 `### Weekday, Month DD, YYYY HH:MM AM/PM`（如 `### Friday, February 13, 2026 21:35 PM`），第二行写该时刻发生的事；条与条之间空一行。时间可从被压缩条目的 `createdTime` 取。
- **简短**：每条一句话概括即可，不必逐条复述原文。
- **可延续**：后续若再次压缩或用户追问「之前我们聊了什么」，仅凭这条 summary 能还原主要话题和结论。
- **包含**：主要话题/用户目标、关键结论或已达成结果、未完成事项或待办（如有）、重要约定（如偏好、时间）。

示例（时间用 `###` 标题，内容下一行，条与条之间空一行）：

```
### Friday, February 13, 2026 20:25 PM
User asked for weekly report every Friday.

### Friday, February 13, 2026 20:29 PM
Set cron for Fri 21:00 and wrote skill; user confirmed.

### Friday, February 13, 2026 20:30 PM
No follow-up; context compressed.
```

压缩后，这条 system-event 会带有 `data.type="context-compressed"` 以及 `preservedCount`、`removedCount`，便于你或前端识别。
