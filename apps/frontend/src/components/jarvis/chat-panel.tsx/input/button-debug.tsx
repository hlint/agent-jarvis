import { BugIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import useJarvisStore from "../../hooks/use-jarvis-store";

export default function ButtonDebug() {
  const debugMode = useJarvisStore((s) => s.debugMode);
  const setDebugMode = useJarvisStore((s) => s.setDebugMode);
  const hasMessages = useJarvisStore(
    (s) => (s.currentSession?.rounds.length ?? 0) > 0,
  );

  if (!hasMessages) return null;

  return (
    <Button
      variant={debugMode ? "default" : "ghost"}
      size="icon-lg"
      title="Debug"
      onClick={() => setDebugMode(!debugMode)}
    >
      <BugIcon />
    </Button>
  );
}
