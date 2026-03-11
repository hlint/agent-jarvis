import { smartTimeFormat } from "@repo/shared/lib/time";

export default function JarvisUserEntry({
  text,
  createdAt,
}: {
  text: string;
  createdAt: number;
}) {
  return (
    <div className="flex flex-col gap-3 items-end text-sm">
      <p className="bg-primary/40 border border-foreground/10 p-3 rounded-xl whitespace-pre-wrap max-w-md overflow-auto">
        {text}
      </p>
      <span className="text-xs text-muted-foreground">
        {smartTimeFormat(createdAt)}
      </span>
    </div>
  );
}
