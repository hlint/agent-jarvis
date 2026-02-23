import ButtonClearHistory from "./button-clear-history";
import ButtonDebug from "./button-debug";
import ButtonSend from "./button-send";
import ButtonUpload from "./button-upload";

export default function InputToolbar() {
  return (
    <div className="flex flex-row gap-2 items-center p-2 ">
      <ButtonUpload />
      <ButtonClearHistory />
      <ButtonDebug />
      <StateIndicator />
      <ButtonSend />
    </div>
  );
}

function StateIndicator() {
  return null;
}
