import useJarvisStore from "./use-jarvis-store";

export default function JarvisTop() {
  const dialogHistory = useJarvisStore((state) => state.dialogHistory);
  const isEmpty = dialogHistory.length === 0;
  return (
    <div className="sticky top-0 z-10">
      <div className="min-h-12 bg-background flex gap-1.5 items-center justify-center">
        {isEmpty ? (
          ""
        ) : (
          <>
            <img src="/favicon.png" alt="Jarvis" className="size-6" />
            <h2 className="text-lg font-bold bg-linear-to-r from-red-200 via-blue-200 to-green-200 bg-clip-text text-transparent">
              Agent Jarvis
            </h2>
          </>
        )}
      </div>
      <div className="h-4 bg-from-transparent to-background bg-linear-to-t" />
    </div>
  );
}
