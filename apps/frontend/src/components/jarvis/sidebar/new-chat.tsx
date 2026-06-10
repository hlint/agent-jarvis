import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import useJarvisStore from "../hooks/use-jarvis-store";

export default function JarvisSidebarNewChat() {
  const startNewConversation = useJarvisStore(
    (state) => state.startNewConversation,
  );

  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full justify-start gap-2"
      onClick={() => startNewConversation()}
    >
      <PlusIcon className="size-4" />
      New Chat
    </Button>
  );
}
