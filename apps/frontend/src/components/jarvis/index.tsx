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
    <div className="max-w-4xl mx-auto h-screen relative flex flex-col">
      <JarvisTop />
      <div className="flex-1 lg:flex-0 lg:min-h-[350px]">
        {isEmpty ? <JarvisWelcome /> : <JarvisMessages />}
      </div>
      <JarvisInput />
    </div>
  );
}
