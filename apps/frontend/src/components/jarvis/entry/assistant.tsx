import JarvisMarkdown from "../components/markdown";

export default function JarvisAssistantEntry({
  text,
  status,
}: {
  text: string;
  status: "pending" | "completed" | "failed";
}) {
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
