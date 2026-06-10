import JarvisMarkdown from "@/components/jarvis/components/markdown";
import { cn } from "@/lib/utils";

export default function MarkdownView({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={cn("max-h-48 overflow-auto text-xs/relaxed", className)}>
      <JarvisMarkdown text={text} />
    </div>
  );
}
