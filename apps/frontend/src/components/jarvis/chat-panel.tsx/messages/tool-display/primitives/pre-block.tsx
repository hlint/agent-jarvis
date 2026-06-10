import { cn } from "@/lib/utils";

export default function PreBlock({
  children,
  className,
  variant = "default",
}: {
  children: string;
  className?: string;
  variant?: "default" | "terminal" | "stderr" | "diff";
}) {
  return (
    <pre
      className={cn(
        "m-0 max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-md border px-2 py-1.5 font-mono text-xs leading-relaxed",
        variant === "default" && "border-border/60 bg-muted/30 text-foreground",
        variant === "terminal" &&
          "border-border/40 bg-muted/60 text-foreground",
        variant === "stderr" &&
          "border-destructive/30 bg-destructive/5 text-destructive",
        variant === "diff" &&
          "border-border/60 bg-subbackground text-foreground",
        className,
      )}
    >
      {children}
    </pre>
  );
}
