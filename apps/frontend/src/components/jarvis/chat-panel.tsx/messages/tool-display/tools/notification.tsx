import { Badge } from "@/components/ui/badge";
import { BellIcon } from "lucide-react";
import type { ToolBadgeDescriptor } from "../badges/types";
import MarkdownView from "../primitives/markdown-view";
import ToolSection from "../primitives/section";
import {
  clampBadgeLabel,
  formatBadgeObject,
  getBooleanField,
  getStringField,
  normalizeBadgeText,
  type ToolRecord,
} from "../utils";

export function resolveNotificationToolBadge(
  input: ToolRecord,
): ToolBadgeDescriptor {
  const source = getStringField(input, "source");
  const content = getStringField(input, "content") ?? "";
  const object = source ?? (content ? normalizeBadgeText(content) : null);
  return {
    icon: BellIcon,
    label: clampBadgeLabel(formatBadgeObject(object, "Notify")),
  };
}

export default function NotificationToolDisplay({
  input,
  output,
  showOutput,
}: {
  input: ToolRecord;
  output: ToolRecord;
  showOutput: boolean;
}) {
  const content = getStringField(input, "content") ?? "";
  const source = getStringField(input, "source");

  return (
    <>
      <ToolSection label="Input">
        {source ? <Badge variant="outline">{source}</Badge> : null}
        <MarkdownView text={content || "(empty)"} />
      </ToolSection>
      {showOutput && output ? (
        <ToolSection label="Output">
          {getBooleanField(output, "success") === true ? (
            <p className="text-xs text-muted-foreground">
              ✓ Notification created
            </p>
          ) : (
            <p className="text-xs text-destructive">
              {getStringField(output, "error") ?? "Failed"}
            </p>
          )}
        </ToolSection>
      ) : null}
    </>
  );
}
