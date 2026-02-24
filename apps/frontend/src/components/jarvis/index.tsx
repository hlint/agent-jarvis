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
    <div className=" h-screen overflow-auto">
      <div className="max-w-4xl mx-auto relative flex flex-col gap-6">
        <JarvisTop />
        <div className="flex-1 lg:flex-none lg:min-h-[350px]">
          {isEmpty ? <JarvisWelcome /> : <JarvisMessages />}
        </div>
        <JarvisInput />
      </div>
    </div>
  );
}
