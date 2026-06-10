export const JARVIS_CHAT_INPUT_ID = "jarvis-chat-input";

export function focusChatInput(setInputMode: (mode: "text" | "voice") => void) {
  setInputMode("text");
  requestAnimationFrame(() => {
    document.getElementById(JARVIS_CHAT_INPUT_ID)?.focus();
  });
}
