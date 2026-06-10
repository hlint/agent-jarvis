import { FileTextIcon } from "lucide-react";
import type { ToolBadgeDescriptor } from "../badges/types";
import PathChip from "../primitives/path-chip";
import PreBlock from "../primitives/pre-block";
import ToolSection from "../primitives/section";
import {
  clampBadgeLabel,
  formatBadgeObject,
  getStringField,
  shortPath,
  type ToolRecord,
} from "../utils";

export function resolveReadFileToolBadge(input: ToolRecord): ToolBadgeDescriptor {
  const path = getStringField(input, "path");
  return {
    icon: FileTextIcon,
    label: clampBadgeLabel(
      formatBadgeObject(path ? shortPath(path) : null, "Read"),
    ),
  };
}

export default function ReadFileToolDisplay({
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
