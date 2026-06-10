import { Badge } from "@/components/ui/badge";
import { ListChecksIcon } from "lucide-react";
import type { ToolBadgeDescriptor } from "../badges/types";
import MarkdownView from "../primitives/markdown-view";
import ToolSection from "../primitives/section";
import {
  clampBadgeLabel,
  getBooleanField,
  getStringField,
  type ToolRecord,
} from "../utils";

export function resolveSetupPlanToolBadge(): ToolBadgeDescriptor {
  return {
    icon: ListChecksIcon,
    label: clampBadgeLabel("Plan"),
  };
}

export default function SetupPlanToolDisplay({
  input,
  output,
  showOutput,
}: {
  input: ToolRecord;
  output: ToolRecord;
  showOutput: boolean;
}) {
  const plan = getStringField(input, "plan") ?? "";

  return (
    <>
      <ToolSection label="Input">
        <MarkdownView text={plan || "(empty)"} />
      </ToolSection>
      {showOutput && output ? (
        <ToolSection label="Output">
          <div className="flex flex-wrap items-center gap-2">
            {getBooleanField(output, "success") === true ? (
              <Badge variant="secondary">success</Badge>
            ) : (
              <Badge variant="destructive">failed</Badge>
            )}
            {getBooleanField(output, "replaced") ? (
              <Badge variant="outline">replaced</Badge>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            {getStringField(output, "summary") ??
              getStringField(output, "error") ??
              ""}
          </p>
        </ToolSection>
      ) : null}
    </>
  );
}
