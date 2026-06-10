import { buildJarvisFileUrl } from "@/components/jarvis/whiteboard/file-url";
import { Badge } from "@/components/ui/badge";
import { ImageIcon } from "lucide-react";
import type { ToolBadgeDescriptor } from "../badges/types";
import MarkdownView from "../primitives/markdown-view";
import PathChip from "../primitives/path-chip";
import ToolSection from "../primitives/section";
import {
  clampBadgeLabel,
  formatBadgeObject,
  getArrayField,
  getBooleanField,
  getStringField,
  normalizeBadgeText,
  type ToolRecord,
} from "../utils";

export function resolveImageGenerationToolBadge(
  input: ToolRecord,
): ToolBadgeDescriptor {
  const filename = getStringField(input, "filename");
  const prompt = getStringField(input, "prompt") ?? "";
  const object = filename ?? (prompt ? normalizeBadgeText(prompt) : null);
  return {
    icon: ImageIcon,
    label: clampBadgeLabel(formatBadgeObject(object, "Image")),
  };
}

export default function ImageGenerationToolDisplay({
  input,
  output,
  showOutput,
}: {
  input: ToolRecord;
  output: ToolRecord;
  showOutput: boolean;
}) {
  const prompt = getStringField(input, "prompt") ?? "";
  const filename = getStringField(input, "filename");
  const dir = getStringField(input, "dir");
  const aspectRatio = getStringField(input, "aspectRatio");
  const referenceImages = getArrayField(input, "referenceImages") ?? [];
  const outPath = getStringField(output, "path");

  return (
    <>
      <ToolSection label="Input">
        <MarkdownView text={prompt || "(empty)"} />
        <div className="flex flex-wrap gap-1.5">
          {filename ? <Badge variant="outline">{filename}</Badge> : null}
          {dir ? <PathChip path={dir} /> : null}
          {aspectRatio ? <Badge variant="outline">{aspectRatio}</Badge> : null}
        </div>
        {referenceImages.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {referenceImages.map((ref) =>
              typeof ref === "string" ? (
                <li key={ref} className="font-mono text-xs truncate">
                  ref: {ref}
                </li>
              ) : null,
            )}
          </ul>
        ) : null}
      </ToolSection>
      {showOutput && output ? (
        <ToolSection label="Output">
          {getBooleanField(output, "success") === true && outPath ? (
            <>
              <img
                src={buildJarvisFileUrl(outPath)}
                alt={getStringField(output, "filename") ?? "Generated image"}
                className="max-h-40 w-full rounded-md border border-border/60 object-contain bg-muted/20"
              />
              <PathChip path={outPath} />
            </>
          ) : (
            <p className="text-xs text-destructive">
              {getStringField(output, "error") ??
                getStringField(output, "message") ??
                "Failed"}
            </p>
          )}
        </ToolSection>
      ) : null}
    </>
  );
}
