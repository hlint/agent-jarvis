import { TagIcon } from "lucide-react";
import type { ToolBadgeDescriptor } from "../badges/types";
import ToolSection from "../primitives/section";
import {
  clampBadgeLabel,
  formatBadgeObject,
  getBooleanField,
  getStringField,
  normalizeBadgeText,
  type ToolRecord,
} from "../utils";

export function resolveRenameSessionToolBadge(
  input: ToolRecord,
): ToolBadgeDescriptor {
  const name = getStringField(input, "name");
  return {
    icon: TagIcon,
    label: clampBadgeLabel(
      formatBadgeObject(name ? normalizeBadgeText(name) : null, "Rename"),
    ),
  };
}

export default function RenameSessionToolDisplay({
  input,
  output,
  showOutput,
}: {
  input: ToolRecord;
  output: ToolRecord;
  showOutput: boolean;
}) {
  const name = getStringField(input, "name");

  return (
    <>
      <ToolSection label="Input">
        <p className="text-sm font-medium">{name ?? "(empty)"}</p>
      </ToolSection>
      {showOutput && output ? (
        <ToolSection label="Output">
          <p className="text-xs text-muted-foreground">
            {getBooleanField(output, "success") === true
              ? "✓ Session renamed"
              : (getStringField(output, "error") ?? "Failed")}
          </p>
        </ToolSection>
      ) : null}
    </>
  );
}
