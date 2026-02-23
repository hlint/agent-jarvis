import { Button } from "@/components/ui/button";
import useJarvisStore from "../use-jarvis-store";

export default function ButtonSend() {
  const sendMessage = useJarvisStore((s) => s.sendMessage);
  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      className="group ml-auto"
      title="Send Message"
      onClick={sendMessage}
    >
      <img
        src="/favicon.png"
        alt="Jarvis"
        className="transition-all duration-200 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]"
      />
    </Button>
  );
}
