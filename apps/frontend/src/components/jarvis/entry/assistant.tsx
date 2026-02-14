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
    return <StatusIcon status="pending" />;
  }
  return (
    <div className="flex flex-row gap-2 items-start">
      <JarvisMarkdown
        className="overflow-auto mr-2"
        text={text}
        isAnimating={status === "pending"}
      />
    </div>
  );
}
