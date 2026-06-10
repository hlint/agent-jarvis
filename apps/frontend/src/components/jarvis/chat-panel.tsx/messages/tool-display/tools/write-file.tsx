import { Badge } from "@/components/ui/badge";
import { FilePenIcon, FilePlusIcon } from "lucide-react";
import type { ToolBadgeDescriptor } from "../badges/types";
import PathChip from "../primitives/path-chip";
import PreBlock from "../primitives/pre-block";
import ToolSection from "../primitives/section";
import {
  clampBadgeLabel,
  formatBadgeObject,
  getBooleanField,
  getNumberField,
  getStringField,
  shortPath,
  type ToolRecord,
} from "../utils";

function resolveWriteLikeToolBadge(
  input: ToolRecord,
  fallback: "Write" | "Append",
  icon: ToolBadgeDescriptor["icon"],
): ToolBadgeDescriptor {
  const path = getStringField(input, "path");
  return {
    icon,
    label: clampBadgeLabel(
      formatBadgeObject(path ? shortPath(path) : null, fallback),
    ),
  };
}

export function resolveWriteFileToolBadge(input: ToolRecord): ToolBadgeDescriptor {
  return resolveWriteLikeToolBadge(input, "Write", FilePenIcon);
}

export function resolveAppendFileToolBadge(
  input: ToolRecord,
): ToolBadgeDescriptor {
  return resolveWriteLikeToolBadge(input, "Append", FilePlusIcon);
}

export default function WriteLikeToolDisplay({
  input,
  output,
  showOutput,
  actionLabel,
}: {
  input: ToolRecord;
  output: ToolRecord;
  showOutput: boolean;
  actionLabel: "write" | "append";
}) {
  const path = getStringField(input, "path");
  const content = getStringField(input, "content") ?? "";
  const outPath = getStringField(output, "path");
  const bytes = getNumberField(output, "bytes");

  return (
    <>
      <ToolSection label="Input">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{actionLabel}</Badge>
          {path ? <PathChip path={path} /> : null}
        </div>
        <ToolSection label="content">
          <PreBlock>{content || "(empty)"}</PreBlock>
        </ToolSection>
      </ToolSection>
      {showOutput && output ? (
        <ToolSection label="Output">
          <p className="text-xs text-muted-foreground">
            {getBooleanField(output, "ok") === true ? "✓" : "✗"}{" "}
            {actionLabel === "write" ? "Written" : "Appended"}
            {outPath ? ` · ${outPath}` : ""}
            {bytes != null ? ` · ${bytes} bytes` : ""}
          </p>
        </ToolSection>
      ) : null}
    </>
  );
}
