import { Badge } from "@/components/ui/badge";
import { BotIcon, ScanIcon } from "lucide-react";
import type { ToolBadgeDescriptor } from "../badges/types";
import MarkdownView from "../primitives/markdown-view";
import PreBlock from "../primitives/pre-block";
import ToolSection from "../primitives/section";
import {
  clampBadgeLabel,
  formatBadgeObject,
  getArrayField,
  getBooleanField,
  getStringField,
  normalizeBadgeText,
  shortPath,
  type ToolRecord,
} from "../utils";

export function resolveCallSubagentToolBadge(
  input: ToolRecord,
): ToolBadgeDescriptor {
  const sessionName = getStringField(input, "sessionName");
  const instruction = getStringField(input, "instruction") ?? "";
  const object =
    sessionName ?? (instruction ? normalizeBadgeText(instruction) : null);
  return {
    icon: BotIcon,
    label: clampBadgeLabel(formatBadgeObject(object, "Agent")),
  };
}

export function resolveMultimodalToolBadge(input: ToolRecord): ToolBadgeDescriptor {
  const fileType = getStringField(input, "fileType");
  const files = getArrayField(input, "files") ?? [];
  const object =
    fileType ??
    (files.length > 1
      ? `${files.length} files`
      : files.length === 1 && typeof files[0] === "string"
        ? shortPath(files[0] as string)
        : null);
  return {
    icon: ScanIcon,
    label: clampBadgeLabel(formatBadgeObject(object, "Analyze")),
  };
}

export default function CallSubagentToolDisplay({
  input,
  output,
  showOutput,
}: {
  input: ToolRecord;
  output: ToolRecord;
  showOutput: boolean;
}) {
  const sessionName = getStringField(input, "sessionName");
  const instruction = getStringField(input, "instruction") ?? "";
  const resultText = getStringField(output, "output") ?? "";

  return (
    <>
      <ToolSection label="Input">
        {sessionName ? <Badge variant="outline">{sessionName}</Badge> : null}
        <MarkdownView text={instruction || "(empty)"} />
      </ToolSection>
      {showOutput && output ? (
        <ToolSection label="Output">
          <div className="flex flex-wrap gap-1.5">
            {getBooleanField(output, "success") === true ? (
              <Badge variant="secondary">success</Badge>
            ) : (
              <Badge variant="destructive">failed</Badge>
            )}
          </div>
          {getStringField(output, "error") ? (
            <p className="text-xs text-destructive">
              {getStringField(output, "error")}
            </p>
          ) : null}
          {resultText ? <PreBlock>{resultText}</PreBlock> : null}
        </ToolSection>
      ) : null}
    </>
  );
}

export function MultimodalToolDisplay({
  input,
  outputText,
  showOutput,
}: {
  input: ToolRecord;
  outputText: string | null;
  showOutput: boolean;
}) {
  const fileType = getStringField(input, "fileType");
  const instruction = getStringField(input, "instruction") ?? "";
  const files = getArrayField(input, "files") ?? [];

  return (
    <>
      <ToolSection label="Input">
        {fileType ? <Badge variant="outline">{fileType}</Badge> : null}
        {files.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {files.map((file) =>
              typeof file === "string" ? (
                <li key={file} className="font-mono text-xs truncate">
                  {file}
                </li>
              ) : null,
            )}
          </ul>
        ) : null}
        <MarkdownView text={instruction || "(empty)"} />
      </ToolSection>
      {showOutput && outputText != null ? (
        <ToolSection label="Output">
          <PreBlock>{outputText}</PreBlock>
        </ToolSection>
      ) : null}
    </>
  );
}
