import { Switch } from "../../ui/switch";
import useJarvisStore from "../use-jarvis-store";

export default function DebugModeSwitch() {
  const debugMode = useJarvisStore((s) => s.debugMode);
  const setDebugMode = useJarvisStore((s) => s.setDebugMode);
  return (
    <div className="flex items-center gap-2">
      <Switch
        id="jarvis-debug-mode"
        checked={debugMode}
        onCheckedChange={(checked) => setDebugMode(checked)}
      />
      <label
        htmlFor="jarvis-debug-mode"
        className="text-sm text-muted-foreground cursor-pointer"
      >
        Debug
      </label>
    </div>
  );
}
