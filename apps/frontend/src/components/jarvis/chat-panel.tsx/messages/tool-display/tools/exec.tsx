import { Badge } from "@/components/ui/badge";
import { TerminalIcon } from "lucide-react";
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
  shortCommand,
  type ToolRecord,
} from "../utils";

export function resolveExecToolBadge(input: ToolRecord): ToolBadgeDescriptor {
  const command = getStringField(input, "command") ?? "";
  return {
    icon: TerminalIcon,
    label: clampBadgeLabel(
      formatBadgeObject(shortCommand(command) || null, "Run"),
    ),
  };
}

export default function ExecToolDisplay({
  input,
  output,
  showOutput,
}: {
  input: ToolRecord;
  output: ToolRecord;
  showOutput: boolean;
}) {
  const cwd = getStringField(input, "cwd") ?? "runtime/";
  const command = getStringField(input, "command") ?? "";
  const stdout = getStringField(output, "stdout") ?? "";
  const stderr = getStringField(output, "stderr") ?? "";
  const exitCode = getNumberField(output, "exitCode");
  const exitedDueToTimeout =
    getBooleanField(output, "exitedDueToTimeout") === true;

  return (
    <>
      <ToolSection label="Input">
        <ToolSection label="cwd">
          <PathChip path={cwd} />
        </ToolSection>
        <ToolSection label="command">
          <PreBlock variant="terminal">{command || "(empty)"}</PreBlock>
        </ToolSection>
      </ToolSection>
      {showOutput ? (
        <ToolSection label="Output">
          <div className="flex flex-wrap items-center gap-1.5">
            {exitCode != null ? (
              <Badge variant={exitCode === 0 ? "secondary" : "destructive"}>
                exit {exitCode}
              </Badge>
            ) : null}
            {exitedDueToTimeout ? (
              <Badge
                variant="outline"
                className="border-amber-500/50 text-amber-600"
              >
                timeout
              </Badge>
            ) : null}
          </div>
          <ToolSection label="stdout">
            <PreBlock variant="terminal">
              {stdout.length > 0 ? stdout : "(empty)"}
            </PreBlock>
          </ToolSection>
          {(stderr.length > 0 || exitCode !== 0) && (
            <ToolSection label="stderr">
              <PreBlock variant="stderr">
                {stderr.length > 0 ? stderr : "(empty)"}
              </PreBlock>
            </ToolSection>
          )}
        </ToolSection>
      ) : null}
    </>
  );
}
