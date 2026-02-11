import type Jarvis from "../../jarvis";

export const MEMORY_HEADER = `LONG-TERM MEMORY

长期记忆存储需要持久记住的关键信息，任何不在长期记忆中的信息都可能被遗忘。你可以使用工具 [update-memory] 来更新它。

⚠️ 重要警告：update-memory 工具会完全覆盖整个记忆文件，不是局部修改。调用时必须：
1. 基于你的当前长期记忆内容
2. 保留所有你认为重要的现有信息
3. 将新信息与现有内容合并后，提供完整的记忆内容（不能只传新增部分）

建议更新长期记忆的场景：
- 用户明确更新个人信息（姓名、偏好、设置等）
- 用户要求记住新的偏好或习惯
- 发现记忆中的信息已过时或错误
- 需要记录重要的、长远的约定

当前长期记忆内容：

`;

export function getMemorySection(jarvis: Jarvis): string {
  return MEMORY_HEADER + jarvis.memory.getLongTermMemory();
}
