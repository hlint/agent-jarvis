import JarvisInput from "@/components/jarvis/input";
import JarvisMessages from "@/components/jarvis/messages";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto h-full relative">
      <div className="sticky top-0 z-10 h-16 from-transparent to-background bg-linear-to-t" />
      <JarvisMessages />
      <JarvisInput />
    </div>
  );
}
