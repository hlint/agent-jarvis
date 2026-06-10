import { cn } from "@/lib/utils";

export function ToolDisplayShell({
  toolCall,
  children,
  className,
}: {
  toolCall: {
    toolName: string;
    status: "pending" | "completed" | "failed";
    error?: unknown;
  };
  children: React.ReactNode;
  className?: string;
}) {
  const isFailed = toolCall.status === "failed";
  const isPending = toolCall.status === "pending";

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-3",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-border/60 pb-2">
        <span className="font-mono text-sm font-medium">
          {toolCall.toolName}
        </span>
        {isPending ? (
          <span className="text-xs text-primary">running…</span>
        ) : null}
        {isFailed ? (
          <span className="text-xs text-destructive">failed</span>
        ) : null}
      </div>
      {isFailed && toolCall.error != null ? (
        <PreBlock variant="stderr">{formatError(toolCall.error)}</PreBlock>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

function formatError(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return String(error);
  }
}

function PreBlock({
  children,
  variant,
}: {
  children: string;
  variant?: "stderr";
}) {
  return (
    <pre
      className={cn(
        "m-0 max-h-32 overflow-auto whitespace-pre-wrap break-all rounded-md border px-2 py-1.5 font-mono text-xs leading-relaxed",
        variant === "stderr" &&
          "border-destructive/30 bg-destructive/5 text-destructive",
      )}
    >
      {children}
    </pre>
  );
}
