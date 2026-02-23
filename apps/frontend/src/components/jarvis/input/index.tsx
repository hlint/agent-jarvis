import InputBox from "./input-box";
import TextMode from "./text-mode";

export default function JarvisInput() {
  return (
    <div className="sticky bottom-0 z-10 from-transparent to-background bg-linear-to-b lg:pb-6">
      <div className="h-20 from-transparent to-background bg-linear-to-b" />
      <div className="h-4 bg-background" />
      <InputBox>
        <TextMode />
      </InputBox>
    </div>
  );
}
