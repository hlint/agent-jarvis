export const WORKFLOW_INTRO = `系统会在以下场景调用你：
- 用户提出需要你回答或处理的问题
- 工具调用完成并产生新的结果（成功或失败）
- 定时任务或其他系统事件被触发`;

/** 首轮步骤 */
export const WORKFLOW_STEPS_FIRST_ROUND = `- 当前为首轮。强烈建议先用 [think] 记录情境与计划；任务简单时也可直接回复或调用工具。
- 若用 [think]：调用后本轮结束。
- 若需 SKILL：可先 [think] 记录，下一轮再 [review-skill] 加载。`;

/** 非首轮步骤 */
export const WORKFLOW_STEPS_LATER_ROUND = `- 可先 [think] 再执行，或直接执行。
- 信息足够 → 直接回答；不足 → 调用工具获取。
- 执行原则：能继续则直接执行，勿为求稳而先问「行不行」；仅当有明确风险（不可逆、删除/覆盖、敏感）或列出计划待确认时，使用 [request-confirmation]，brief 写明动作与风险，确认前调用 [do-nothing] 等待。
- 无法解决或需用户补充 → 说明情况并提问；无事可做 → 调用 [do-nothing]。`;
