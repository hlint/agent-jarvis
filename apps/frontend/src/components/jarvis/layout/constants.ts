/** Desktop: show three-column layout with left nav (≥ 1304px, same as original 1024 + 280) */
export const DESKTOP_NAV_BREAKPOINT = 1304;

export const NAV_COLUMN_WIDTH_PX = 260;
export const WHITEBOARD_COLUMN_MIN_PX = 320;
export const WHITEBOARD_COLUMN_MAX_PX = 480;

export const SIDEBAR_WIDTH_CLASS = "w-[260px] max-w-[85vw]";
export const WHITEBOARD_WIDTH_CLASS = "w-[480px] max-w-[85vw]";

/** Mobile overlay panel: same max width as desktop, up to 85% of viewport (≥ 15% backdrop tappable) */
export const MOBILE_OVERLAY_MAX_WIDTH = "85vw";

export type JarvisLayoutMode = "mobile-overlay" | "triple";

/** Shared centered width container for chat messages and input */
export const CHAT_CONTENT_CLASS = "mx-auto w-full max-w-3xl px-3";
