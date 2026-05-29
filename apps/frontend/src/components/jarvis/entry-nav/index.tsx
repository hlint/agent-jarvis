import { JarvisEntryNavDecoBottom, JarvisEntryNavDecoTop } from "./decos";
import JarvisEntryNavList from "./list";

export default function JarvisEntryNav() {
  return (
    <div className="h-screen overflow-auto shrink-0 sticky top-0 w-[260px] flex flex-col gap-0 px-2">
      <JarvisEntryNavDecoTop />
      <JarvisEntryNavList />
      <JarvisEntryNavDecoBottom />
    </div>
  );
}
