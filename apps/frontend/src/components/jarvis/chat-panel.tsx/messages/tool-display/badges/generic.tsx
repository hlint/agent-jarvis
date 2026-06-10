import { WrenchIcon } from "lucide-react";
import { clampBadgeLabel } from "../utils";
import type { ToolBadgeDescriptor } from "./types";

export function resolveFallbackToolBadge(toolName: string): ToolBadgeDescriptor {
  return {
    icon: WrenchIcon,
    label: clampBadgeLabel(toolName),
  };
}
