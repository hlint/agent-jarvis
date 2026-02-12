import type Jarvis from "../jarvis";
import { buildFirstRoundPrompt } from "./first-round";
import { buildLaterRoundPrompt } from "./later-round";

/**
 * 根据是否为首轮生成对应的完整系统提示词。
 * 首轮：强烈建议先用 [think] 记录，也可直接回复或调用工具。
 * 非首轮：可自行决定是否 think，然后按正常流程执行。
 */
export default function systemPromptBuilder(
  jarvis: Jarvis,
  isFirstRound?: boolean,
): string {
  return isFirstRound
    ? buildFirstRoundPrompt(jarvis)
    : buildLaterRoundPrompt(jarvis);
}
