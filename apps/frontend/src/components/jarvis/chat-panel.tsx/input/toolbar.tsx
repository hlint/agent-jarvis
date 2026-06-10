import ButtonDebug from "./button-debug";
import ButtonSend from "./button-send";
import ButtonUpload from "./button-upload";
import ButtonVoice from "./button-voice";
import TokenDisplay from "./token-display";

export default function InputToolbar() {
  return (
    <div className="flex flex-row gap-1.5 items-center ">
      <ButtonUpload />
      <ButtonVoice />
      <ButtonDebug />
      <TokenDisplay />
      <ButtonSend />
    </div>
  );
}
