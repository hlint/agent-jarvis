import JarvisInput from "./input";
import JarvisMessages from "./messages";
import JarvisTop from "./top";
import useConnect from "./use-connect";
import useJarvisStore from "./use-jarvis-store";
import JarvisWelcome from "./welcome";

export default function Jarvis() {
  useConnect();
  const dialogHistory = useJarvisStore((state) => state.dialogHistory);
  const isEmpty = dialogHistory.length === 0;
  return (
    <div className="max-w-4xl mx-auto h-full relative">
      <JarvisTop />
      {isEmpty ? <JarvisWelcome /> : <JarvisMessages />}
      <JarvisInput />
    </div>
  );
}
