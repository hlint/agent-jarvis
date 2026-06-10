import type { AssistantMessage } from "@repo/shared/defines/message";
import { resolveCronToolBadge } from "../tools/cron";
import { resolveEditFileToolBadge } from "../tools/edit-file";
import { resolveExecToolBadge } from "../tools/exec";
import { resolveHeadroomToolBadge } from "../tools/headroom";
import { resolveImageGenerationToolBadge } from "../tools/image-generation";
import { resolveNotificationToolBadge } from "../tools/notification";
import {
  resolveEnsureDirToolBadge,
  resolveReadDirToolBadge,
} from "../tools/read-dir";
import { resolveReadFileToolBadge } from "../tools/read-file";
import { resolveRenameSessionToolBadge } from "../tools/rename-session";
import { resolveSetupPlanToolBadge } from "../tools/setup-plan";
import {
  resolveCallSubagentToolBadge,
  resolveMultimodalToolBadge,
} from "../tools/subagent";
import {
  resolveWebExtractToolBadge,
  resolveWebSearchToolBadge,
} from "../tools/web";
import { resolveWhiteboardToolBadge } from "../tools/whiteboard";
import {
  resolveAppendFileToolBadge,
  resolveWriteFileToolBadge,
} from "../tools/write-file";
import { asRecord } from "../utils";
import { resolveFallbackToolBadge } from "./generic";
import type { ToolBadgeDescriptor } from "./types";

type ToolCall = AssistantMessage["toolCalls"][number];

export function resolveToolBadge(toolCall: ToolCall): ToolBadgeDescriptor {
  const input = asRecord(toolCall.toolInput);

  switch (toolCall.toolName) {
    case "exec":
      return resolveExecToolBadge(input);
    case "read_file":
      return resolveReadFileToolBadge(input);
    case "write_file":
      return resolveWriteFileToolBadge(input);
    case "append_to_file":
      return resolveAppendFileToolBadge(input);
    case "edit_file":
      return resolveEditFileToolBadge(input);
    case "read_dir":
      return resolveReadDirToolBadge(input);
    case "ensure_dir":
      return resolveEnsureDirToolBadge(input);
    case "setup_plan":
      return resolveSetupPlanToolBadge();
    case "create_notification":
      return resolveNotificationToolBadge(input);
    case "navigate_whiteboard":
      return resolveWhiteboardToolBadge(input);
    case "rename_session":
      return resolveRenameSessionToolBadge(input);
    case "list_cron_tasks":
      return resolveCronToolBadge();
    case "call_subagent":
      return resolveCallSubagentToolBadge(input);
    case "multimodal_subagent":
      return resolveMultimodalToolBadge(input);
    case "image_generation":
      return resolveImageGenerationToolBadge(input);
    case "headroom_retrieve":
      return resolveHeadroomToolBadge(input);
    case "web_search_tavily":
    case "web_search_searxng":
      return resolveWebSearchToolBadge(input);
    case "web_extract":
      return resolveWebExtractToolBadge(input);
    default:
      return resolveFallbackToolBadge(toolCall.toolName);
  }
}
