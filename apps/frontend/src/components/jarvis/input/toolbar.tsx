import useJarvisStore from "../use-jarvis-store";
import ButtonNewConversation from "./button-new-conversation";
import ButtonDebug from "./button-debug";
import ButtonSend from "./button-send";
import ButtonUpload from "./button-upload";
import ButtonVoice from "./button-voice";
import TokenDisplay from "./token-display";

export default function InputToolbar() {
  const sendMessage = useJarvisStore((s) => s.sendMessage);
  return (
    <div className="flex flex-row gap-1.5 items-center p-2 ">
      <ButtonUpload />
      <ButtonVoice />
      <ButtonDebug />
      <ButtonNewConversation />
      <TokenDisplay />
      <ButtonSend onClick={sendMessage} className="ml-auto" />
    </div>
  );
}
