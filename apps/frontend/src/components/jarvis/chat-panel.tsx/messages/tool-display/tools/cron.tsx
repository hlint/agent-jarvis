import { Badge } from "@/components/ui/badge";
import { CalendarClockIcon } from "lucide-react";
import type { ToolBadgeDescriptor } from "../badges/types";
import PathChip from "../primitives/path-chip";
import ToolSection from "../primitives/section";
import {
  asRecord,
  clampBadgeLabel,
  getArrayField,
  getBooleanField,
  getStringField,
  type ToolRecord,
} from "../utils";

export function resolveCronToolBadge(): ToolBadgeDescriptor {
  return {
    icon: CalendarClockIcon,
    label: clampBadgeLabel("Cron"),
  };
}

export default function CronToolDisplay({
  output,
  showOutput,
}: {
  output: ToolRecord;
  showOutput: boolean;
}) {
  if (!showOutput || !output) {
    return (
      <ToolSection label="Input">
        <p className="text-xs text-muted-foreground">List all cron tasks</p>
      </ToolSection>
    );
  }

  const summary = getStringField(output, "summary");
  const tasks = getArrayField(output, "tasks") ?? [];

  return (
    <>
      <ToolSection label="Input">
        <p className="text-xs text-muted-foreground">List all cron tasks</p>
      </ToolSection>
      <ToolSection label="Output">
        {summary ? (
          <p className="text-xs text-muted-foreground">{summary}</p>
        ) : null}
        <div className="flex flex-col gap-2">
          {tasks.map((task, index) => {
            const row = asRecord(task);
            if (!row) return null;
            const name = getStringField(row, "name") ?? `task-${index}`;
            const loadError = getStringField(row, "loadError");
            const enabled = getBooleanField(row, "enabled");
            return (
              <div
                key={name}
                className="rounded-md border border-border/60 bg-muted/20 px-2 py-1.5 text-xs"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-medium">{name}</span>
                  {enabled === true ? (
                    <Badge variant="secondary">enabled</Badge>
                  ) : enabled === false ? (
                    <Badge variant="outline">disabled</Badge>
                  ) : null}
                  {loadError ? (
                    <Badge variant="destructive">load error</Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-muted-foreground">
                  {getStringField(row, "cronPattern")}
                  {getStringField(row, "nextTriggerTime")
                    ? ` · next ${getStringField(row, "nextTriggerTime")}`
                    : ""}
                </p>
                {getStringField(row, "path") ? (
                  <PathChip
                    path={getStringField(row, "path")!}
                    className="mt-1"
                  />
                ) : null}
                {loadError ? (
                  <p className="mt-1 text-destructive">{loadError}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </ToolSection>
    </>
  );
}
