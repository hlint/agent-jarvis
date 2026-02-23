import useJarvisStore from "../use-jarvis-store";
import ButtonClearHistory from "./button-clear-history";
import ButtonDebug from "./button-debug";
import ButtonSend from "./button-send";
import ButtonUpload from "./button-upload";
import ButtonVoice from "./button-voice";

export default function InputToolbar() {
  const sendMessage = useJarvisStore((s) => s.sendMessage);
  return (
    <div className="flex flex-row gap-1.5 items-center p-2 ">
      <ButtonUpload />
      <ButtonVoice />
      <ButtonClearHistory />
      <StateIndicator />
      <ButtonDebug />
      <ButtonSend onClick={sendMessage} className="ml-auto" />
    </div>
  );
}

function StateIndicator() {
  return null;
}
