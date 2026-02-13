import fs from "fs-extra";
import { PATH_MEMORY } from "../defines";

export const MEMORY_HEADER = `存储需持久记住的关键信息，未在此的信息可能被遗忘。使用工具 [update-memory] 更新。

⚠️ 重要警告：update-memory 工具会完全覆盖整个记忆文件，不是局部修改。调用时必须：
1. 基于AI的当前长期记忆内容
2. 保留所有AI认为重要的现有信息
3. 将新信息与现有内容合并后，提供完整的记忆内容（不能只传新增部分）

建议更新长期记忆的场景：
- 用户明确更新个人信息（姓名、偏好、设置等）
- 用户要求记住新的偏好或习惯
- 发现记忆中的信息已过时或错误
- 需要记录重要的、长远的约定

小技巧：
- 当与用户初次交流或者平时闲聊时，AI可以有意识地提问且引导用户完善这些信息
- 对于不确定是否是长期有效的约定，AI可以询问用户是否需要记住
`;

export function getLongTermMemory() {
  return fs.readFileSync(PATH_MEMORY, "utf8");
}
