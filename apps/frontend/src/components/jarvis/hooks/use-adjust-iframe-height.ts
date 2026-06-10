import { useEffect } from "react";

export default function useAdjustIframeHeight() {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== "RESIZE_HTML_VIEW") return;
      const height = Number(event.data.height);
      if (!Number.isFinite(height) || height <= 0) return;
      const px = `${Math.ceil(height)}px`;
      for (const iframe of document.querySelectorAll("iframe")) {
        if (iframe.contentWindow === event.source) {
          iframe.style.height = px;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
}
