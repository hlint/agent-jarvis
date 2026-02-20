import useJarvisStore from "./use-jarvis-store";

export default function JarvisTop() {
  const dialogHistory = useJarvisStore((state) => state.dialogHistory);
  const isEmpty = dialogHistory.length === 0;
  return (
    <div className="sticky top-0 z-10 min-h-16 bg-gray-50 flex items-center justify-center">
      {isEmpty ? "" : "✨ Agent Jarvis"}
    </div>
  );
}
