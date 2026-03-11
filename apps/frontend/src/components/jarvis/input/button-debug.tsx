import { BugIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import useJarvisStore from "../use-jarvis-store";

export default function ButtonDebug() {
  const debugMode = useJarvisStore((s) => s.debugMode);
  const setDebugMode = useJarvisStore((s) => s.setDebugMode);
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
