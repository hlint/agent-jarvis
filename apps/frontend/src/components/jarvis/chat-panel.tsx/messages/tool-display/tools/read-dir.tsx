import { FolderOpenIcon, FolderPlusIcon } from "lucide-react";
import type { ToolBadgeDescriptor } from "../badges/types";
import PathChip from "../primitives/path-chip";
import PreBlock from "../primitives/pre-block";
import ToolSection from "../primitives/section";
import {
  clampBadgeLabel,
  formatBadgeObject,
  getBooleanField,
  getStringField,
  shortPath,
  type ToolRecord,
} from "../utils";

export function resolveReadDirToolBadge(input: ToolRecord): ToolBadgeDescriptor {
  const path = getStringField(input, "path");
  return {
    icon: FolderOpenIcon,
    label: clampBadgeLabel(
      formatBadgeObject(path ? shortPath(path) : null, "List"),
    ),
  };
}

export function resolveEnsureDirToolBadge(
  input: ToolRecord,
): ToolBadgeDescriptor {
  const path = getStringField(input, "path");
  return {
    icon: FolderPlusIcon,
    label: clampBadgeLabel(
      formatBadgeObject(path ? shortPath(path) : null, "Mkdir"),
    ),
  };
}

export default function ReadDirToolDisplay({
  input,
  outputText,
  showOutput,
}: {
  input: ToolRecord;
  outputText: string | null;
  showOutput: boolean;
}) {
  const path = getStringField(input, "path");

  return (
    <>
      <ToolSection label="Input">
        {path ? <PathChip path={path} /> : null}
      </ToolSection>
      {showOutput && outputText != null ? (
        <ToolSection label="Output">
          <PreBlock>{outputText}</PreBlock>
        </ToolSection>
      ) : null}
    </>
  );
}

export function EnsureDirToolDisplay({
  input,
  output,
  showOutput,
}: {
  input: ToolRecord;
  output: ToolRecord;
  showOutput: boolean;
}) {
  const path = getStringField(input, "path");
  const outPath = getStringField(output, "path");

  return (
    <>
      <ToolSection label="Input">
        {path ? <PathChip path={path} /> : null}
      </ToolSection>
      {showOutput && getBooleanField(output, "ok") === true ? (
        <ToolSection label="Output">
          <p className="text-xs text-muted-foreground">
            ✓ Directory ready{outPath ? ` · ${outPath}` : ""}
          </p>
        </ToolSection>
      ) : null}
    </>
  );
}
