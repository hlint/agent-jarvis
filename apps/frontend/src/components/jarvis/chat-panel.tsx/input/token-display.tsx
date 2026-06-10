import type { Session } from "@repo/shared/defines/session";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useJarvisStore from "../../hooks/use-jarvis-store";

export default function TokenDisplay() {
  const currentSession = useJarvisStore((state) => state.currentSession);
  const lastUsage = currentSession?.lastUsage;
  const inputTokens = lastUsage?.inputTokens;
  if (!inputTokens) return null;

  return (
    <Popover>
      <PopoverTrigger
        nativeButton={false}
        className="cursor-pointer"
        render={<Badge variant="secondary" />}
      >
        {formatTokens(inputTokens)}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        sideOffset={6}
        className="w-auto max-w-[90vw] max-h-[min(70vh,20rem)] overflow-y-auto overscroll-contain p-3"
      >
        <UsagePopoverContent usage={lastUsage} />
      </PopoverContent>
    </Popover>
  );
}

function UsagePopoverContent({
  usage,
}: {
  usage: NonNullable<Session["lastUsage"]>;
}) {
  const rows = buildUsageRows(usage);
  if (rows.length === 0) return null;

  return (
    <div className="min-w-36">
      <div className="mb-1.5 text-sm font-medium text-foreground">
        Last Token Usage
      </div>
      <dl className="grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 tabular-nums text-xs">
        {rows.map((row) => (
          <div key={row.key} className="contents">
            <dt
              className={
                row.indent ? "pl-2 text-muted-foreground" : "text-foreground/90"
              }
            >
              {row.label}
            </dt>
            <dd className="text-right text-foreground">
              {formatTokens(row.value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

type UsageRow = {
  key: string;
  label: string;
  value: number;
  indent?: boolean;
};

function buildUsageRows(usage: NonNullable<Session["lastUsage"]>): UsageRow[] {
  const rows: UsageRow[] = [];

  if (usage.inputTokens != null) {
    rows.push({ key: "input", label: "Input", value: usage.inputTokens });
  }
  if (usage.inputTokenDetails.cacheReadTokens != null) {
    rows.push({
      key: "cached",
      label: "Cached",
      value: usage.inputTokenDetails.cacheReadTokens,
      indent: true,
    });
  }
  if (usage.inputTokenDetails?.noCacheTokens != null) {
    rows.push({
      key: "no-cache",
      label: "No cache",
      value: usage.inputTokenDetails.noCacheTokens,
      indent: true,
    });
  }
  if (usage.outputTokens != null) {
    rows.push({ key: "output", label: "Output", value: usage.outputTokens });
  }
  if (usage.outputTokenDetails?.textTokens != null) {
    rows.push({
      key: "text",
      label: "Text",
      value: usage.outputTokenDetails.textTokens,
      indent: true,
    });
  }
  const reasoningTokens = usage.outputTokenDetails?.reasoningTokens;
  if (reasoningTokens != null) {
    rows.push({
      key: "reasoning",
      label: "Reasoning",
      value: reasoningTokens,
      indent: true,
    });
  }
  if (usage.totalTokens != null) {
    rows.push({ key: "total", label: "Total", value: usage.totalTokens });
  }
  if (usage.tokensSavedByHeadroom != null && usage.tokensSavedByHeadroom > 0) {
    rows.push({
      key: "saved",
      label: "Saved (Headroom)",
      value: usage.tokensSavedByHeadroom,
    });
  }

  return rows;
}

function formatTokens(tokens: number) {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
  return tokens.toLocaleString();
}
