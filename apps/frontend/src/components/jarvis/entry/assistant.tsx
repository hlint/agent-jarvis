import JarvisMarkdown from "../components/markdown";
import StatusIcon from "../components/StatusIcon";

export default function JarvisAssistantEntry({
  text,
  status,
}: {
  text: string;
  status: "pending" | "completed" | "failed";
}) {
  if (!text && status === "pending") {
    return (
      <div className="flex">
        <StatusIcon status="pending" />
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-foreground/5 border border-foreground/10 p-3 max-w-[90%]">
      <JarvisMarkdown
        className="overflow-auto mr-2"
        text={text}
        isAnimating={status === "pending"}
      />
    </div>
  );
}
