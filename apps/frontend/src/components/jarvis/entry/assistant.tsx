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
    <div className="rounded-xl bg-background border p-3">
      <JarvisMarkdown
        className="overflow-auto mr-2"
        text={text}
        isAnimating={status === "pending"}
      />
    </div>
  );
}
