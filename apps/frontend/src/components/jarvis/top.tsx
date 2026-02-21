import useJarvisStore from "./use-jarvis-store";

export default function JarvisTop() {
  const dialogHistory = useJarvisStore((state) => state.dialogHistory);
  const isEmpty = dialogHistory.length === 0;
  return (
    <div className="sticky top-0 z-10">
      <div className="min-h-12 bg-background flex items-center justify-center">
        {isEmpty ? (
          ""
        ) : (
          <span className="bg-linear-to-r from-cyan-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent font-medium">
            ✨ Agent Jarvis
          </span>
        )}
      </div>
      <div className="h-4 bg-from-transparent to-background bg-linear-to-t" />
    </div>
  );
}
