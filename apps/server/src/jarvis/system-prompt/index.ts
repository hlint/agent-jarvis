import type Jarvis from "../jarvis";
import { buildFirstRoundPrompt } from "./first-round";
import { buildLaterRoundPrompt } from "./later-round";

/**
 * 根据是否为首轮生成对应的完整系统提示词。
 * 首轮：仅允许使用 [think]，不输出文字、不调用其他工具。
 * 非首轮：可自行决定是否 think，然后按正常流程回复或调用工具。
 * 提示词效果测试: 帮我获取今日github trending pojects，整理出一份文档，完成时通知到我的手机
 */
export default function systemPromptBuilder(
  jarvis: Jarvis,
  isFirstRound?: boolean,
): string {
  return isFirstRound
    ? buildFirstRoundPrompt(jarvis)
    : buildLaterRoundPrompt(jarvis);
}
