import type { AssistantMessage } from "@repo/shared/defines/message";
import GenericToolDisplay from "./generic";
import { ToolDisplayShell } from "./shell";
import CronToolDisplay from "./tools/cron";
import EditFileToolDisplay from "./tools/edit-file";
import ExecToolDisplay from "./tools/exec";
import HeadroomToolDisplay from "./tools/headroom";
import ImageGenerationToolDisplay from "./tools/image-generation";
import NotificationToolDisplay from "./tools/notification";
import ReadDirToolDisplay, { EnsureDirToolDisplay } from "./tools/read-dir";
import ReadFileToolDisplay from "./tools/read-file";
import RenameSessionToolDisplay from "./tools/rename-session";
import SetupPlanToolDisplay from "./tools/setup-plan";
import CallSubagentToolDisplay, {
  MultimodalToolDisplay,
} from "./tools/subagent";
import WebSearchToolDisplay, { WebExtractToolDisplay } from "./tools/web";
import WhiteboardToolDisplay from "./tools/whiteboard";
import WriteLikeToolDisplay from "./tools/write-file";
import { asRecord, asString } from "./utils";

export default function ToolCallDisplay({
  toolCall,
}: {
  toolCall: AssistantMessage["toolCalls"][number];
}) {
  const showOutput = toolCall.status !== "pending";
  const input = asRecord(toolCall.toolInput);
  const output = toolCall.toolOutput;
  const outputRecord = asRecord(output);
  const outputText = asString(output);

  const body = (() => {
    switch (toolCall.toolName) {
      case "exec":
        return (
          <ExecToolDisplay
            input={input}
            output={outputRecord}
            showOutput={showOutput}
          />
        );
      case "read_file":
        return (
          <ReadFileToolDisplay
            input={input}
            outputText={outputText}
            showOutput={showOutput}
          />
        );
      case "write_file":
        return (
          <WriteLikeToolDisplay
            input={input}
            output={outputRecord}
            showOutput={showOutput}
            actionLabel="write"
          />
        );
      case "append_to_file":
        return (
          <WriteLikeToolDisplay
            input={input}
            output={outputRecord}
            showOutput={showOutput}
            actionLabel="append"
          />
        );
      case "edit_file":
        return (
          <EditFileToolDisplay
            input={input}
            output={outputRecord}
            showOutput={showOutput}
          />
        );
      case "read_dir":
        return (
          <ReadDirToolDisplay
            input={input}
            outputText={outputText}
            showOutput={showOutput}
          />
        );
      case "ensure_dir":
        return (
          <EnsureDirToolDisplay
            input={input}
            output={outputRecord}
            showOutput={showOutput}
          />
        );
      case "setup_plan":
        return (
          <SetupPlanToolDisplay
            input={input}
            output={outputRecord}
            showOutput={showOutput}
          />
        );
      case "create_notification":
        return (
          <NotificationToolDisplay
            input={input}
            output={outputRecord}
            showOutput={showOutput}
          />
        );
      case "navigate_whiteboard":
        return (
          <WhiteboardToolDisplay
            input={input}
            output={outputRecord}
            showOutput={showOutput}
          />
        );
      case "rename_session":
        return (
          <RenameSessionToolDisplay
            input={input}
            output={outputRecord}
            showOutput={showOutput}
          />
        );
      case "list_cron_tasks":
        return (
          <CronToolDisplay output={outputRecord} showOutput={showOutput} />
        );
      case "call_subagent":
        return (
          <CallSubagentToolDisplay
            input={input}
            output={outputRecord}
            showOutput={showOutput}
          />
        );
      case "multimodal_subagent":
        return (
          <MultimodalToolDisplay
            input={input}
            outputText={outputText}
            showOutput={showOutput}
          />
        );
      case "image_generation":
        return (
          <ImageGenerationToolDisplay
            input={input}
            output={outputRecord}
            showOutput={showOutput}
          />
        );
      case "headroom_retrieve":
        return <HeadroomToolDisplay input={input} />;
      case "web_search_tavily":
        return (
          <WebSearchToolDisplay
            input={input}
            output={output}
            showOutput={showOutput}
            engine="tavily"
          />
        );
      case "web_search_searxng":
        return (
          <WebSearchToolDisplay
            input={input}
            output={output}
            showOutput={showOutput}
            engine="searxng"
          />
        );
      case "web_extract":
        return (
          <WebExtractToolDisplay
            input={input}
            output={output}
            showOutput={showOutput}
          />
        );
      default:
        return (
          <GenericToolDisplay
            input={toolCall.toolInput}
            output={output}
            showOutput={showOutput}
          />
        );
    }
  })();

  return <ToolDisplayShell toolCall={toolCall}>{body}</ToolDisplayShell>;
}
