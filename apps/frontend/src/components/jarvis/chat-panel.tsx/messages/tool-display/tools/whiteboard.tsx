import { PanelRightOpenIcon } from "lucide-react";
import useJarvisStore from "@/components/jarvis/hooks/use-jarvis-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ToolBadgeDescriptor } from "../badges/types";
import PathChip from "../primitives/path-chip";
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

export function resolveWhiteboardToolBadge(
  input: ToolRecord,
): ToolBadgeDescriptor {
  const path = getStringField(input, "path");
  return {
    icon: PanelRightOpenIcon,
    label: clampBadgeLabel(
      formatBadgeObject(path ? shortPath(path) : null, "Board"),
    ),
  };
}

export default function WhiteboardToolDisplay({
  input,
  output,
  showOutput,
}: {
  input: ToolRecord;
  output: ToolRecord;
  showOutput: boolean;
}) {
  const navigateWhiteboard = useJarvisStore(
    (state) => state.navigateWhiteboard,
  );
  const openWhiteboardPanel = useJarvisStore(
    (state) => state.openWhiteboardPanel,
  );

  const inputPath = getStringField(input, "path");
  const outputPath = getStringField(output, "path");
  const targetPath = outputPath ?? inputPath;

  const handleOpen = () => {
    if (!targetPath) return;
    void navigateWhiteboard(targetPath);
    openWhiteboardPanel();
  };

  return (
    <>
      <ToolSection label="Input">
        <div className="flex flex-wrap items-center gap-2">
          {inputPath ? <PathChip path={inputPath} /> : null}
          {targetPath ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 px-2 text-xs"
              onClick={handleOpen}
            >
              <PanelRightOpenIcon className="size-3.5" />
              Open in whiteboard
            </Button>
          ) : null}
        </div>
      </ToolSection>
      {showOutput && output ? (
        <ToolSection label="Output">
          {getBooleanField(output, "success") === true ? (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>✓ Opened in whiteboard</span>
              {outputPath ? <PathChip path={outputPath} /> : null}
              {getNumberField(output, "revision") != null ? (
                <Badge variant="outline">
                  rev {getNumberField(output, "revision")}
                </Badge>
              ) : null}
              {getBooleanField(output, "refreshed") ? (
                <Badge variant="outline">refreshed</Badge>
              ) : getStringField(output, "previousPath") ? (
                <span>from {getStringField(output, "previousPath")}</span>
              ) : null}
            </div>
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
