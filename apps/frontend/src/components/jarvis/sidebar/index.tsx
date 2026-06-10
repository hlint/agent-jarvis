import { JarvisSidebarDecoBottom, JarvisSidebarDecoTop } from "./decos";
import JarvisSidebarNewChat from "./new-chat";
import JarvisSidebarNotificationList from "./notification-list";
import JarvisSidebarRecentList from "./recent-list";
import JarvisSidebarThemeToggle from "./theme-toggle";

export default function JarvisSidebar() {
  return (
    <div className="flex h-full min-h-0 flex-col py-2">
      <div className="flex shrink-0 flex-col gap-2 pb-1 px-2">
        <JarvisSidebarNewChat />
      </div>
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2">
        <JarvisSidebarDecoTop />
        <JarvisSidebarNotificationList />
        <JarvisSidebarRecentList />
        <JarvisSidebarDecoBottom />
      </div>
      <div className="flex shrink-0 justify-start px-2 pt-2">
        <JarvisSidebarThemeToggle />
      </div>
    </div>
  );
}
