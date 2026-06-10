import { Badge } from "@/components/ui/badge";
import { FileDiffIcon } from "lucide-react";
import type { ToolBadgeDescriptor } from "../badges/types";
import PathChip from "../primitives/path-chip";
import PreBlock from "../primitives/pre-block";
import ToolSection from "../primitives/section";
import {
  clampBadgeLabel,
  formatBadgeObject,
  formatEditFileDiff,
  getBooleanField,
  getStringField,
  shortPath,
  type ToolRecord,
} from "../utils";

export function resolveEditFileToolBadge(input: ToolRecord): ToolBadgeDescriptor {
  const path = getStringField(input, "path");
  return {
    icon: FileDiffIcon,
    label: clampBadgeLabel(
      formatBadgeObject(path ? shortPath(path) : null, "Edit"),
    ),
  };
}

export default function EditFileToolDisplay({
  input,
  output,
  showOutput,
}: {
  input: ToolRecord;
  output: ToolRecord;
  showOutput: boolean;
}) {
  const path = getStringField(input, "path");
  const globalReplace = getBooleanField(input, "globalReplace");
  const diffText = input ? formatEditFileDiff(input) : "";

  return (
    <>
      <ToolSection label="Input">
        <div className="flex flex-wrap items-center gap-2">
          {path ? <PathChip path={path} /> : null}
          {globalReplace ? (
            <Badge variant="outline">global replace</Badge>
          ) : null}
        </div>
        <PreBlock variant="diff">{diffText || "(empty)"}</PreBlock>
      </ToolSection>
      {showOutput && output ? (
        <ToolSection label="Output">
          <p className="text-xs text-muted-foreground">
            {getBooleanField(output, "ok") === true ? "✓ Updated" : "✗ Failed"}
            {getStringField(output, "path")
              ? ` · ${getStringField(output, "path")}`
              : ""}
          </p>
        </ToolSection>
      ) : null}
    </>
  );
}
