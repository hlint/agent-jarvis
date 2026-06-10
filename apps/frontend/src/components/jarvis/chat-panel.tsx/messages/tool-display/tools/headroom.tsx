import { BrainIcon } from "lucide-react";
import type { ToolBadgeDescriptor } from "../badges/types";
import ToolSection from "../primitives/section";
import {
  clampBadgeLabel,
  formatBadgeObject,
  getStringField,
  normalizeBadgeText,
  type ToolRecord,
} from "../utils";

export function resolveHeadroomToolBadge(input: ToolRecord): ToolBadgeDescriptor {
  const query = getStringField(input, "query");
  const hash = getStringField(input, "hash");
  const object = query
    ? normalizeBadgeText(query)
    : hash
      ? normalizeBadgeText(hash)
      : null;
  return {
    icon: BrainIcon,
    label: clampBadgeLabel(formatBadgeObject(object, "Memory")),
  };
}

export default function HeadroomToolDisplay({ input }: { input: ToolRecord }) {
  const hash = getStringField(input, "hash");
  const query = getStringField(input, "query");

  return (
    <ToolSection label="Input">
      {hash ? (
        <p className="font-mono text-xs">
          hash: <span className="text-foreground">{hash}</span>
        </p>
      ) : null}
      {query ? (
        <p className="text-xs text-muted-foreground">query: {query}</p>
      ) : null}
    </ToolSection>
  );
}
