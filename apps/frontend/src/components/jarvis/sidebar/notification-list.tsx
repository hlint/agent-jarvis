import type { Notification } from "@repo/shared/defines/notification";
import { smartTimeFormat } from "@repo/shared/lib/time";
import { XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useJarvisStore from "../hooks/use-jarvis-store";

const notificationVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    y: -6,
    height: 0,
    marginTop: 0,
    marginBottom: 0,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

export default function JarvisSidebarNotificationList() {
  const notifications = useJarvisStore((state) => state.notifications);

  return (
    <div
      className={cn("flex flex-col gap-1", notifications.length > 0 && "pb-2")}
    >
      <AnimatePresence initial={false}>
        {notifications.map((notification) => (
          <JarvisSidebarNotificationItem
            key={notification.id}
            notification={notification}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function JarvisSidebarNotificationItem({
  notification,
}: {
  notification: Notification;
}) {
  const deleteNotification = useJarvisStore(
    (state) => state.deleteNotification,
  );
  const isMobileMode = useJarvisStore((state) => state.isMobileMode);

  return (
    <motion.div
      layout
      variants={notificationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "group flex items-start gap-1 overflow-hidden rounded-md border border-border/60 bg-muted/30 px-1 py-1",
      )}
    >
      <div className="min-w-0 flex-1 px-1 py-0.5">
        <div className="max-h-20 overflow-y-auto text-xs whitespace-pre-wrap wrap-break-word text-foreground">
          {notification.content}
        </div>
        <div className="mt-1 truncate text-[10px] text-muted-foreground/80">
          {notification.source} · {smartTimeFormat(notification.createdAt)}
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn(
          "mt-0.5 shrink-0 transition-opacity",
          isMobileMode ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
        aria-label="Delete notification"
        onClick={() => deleteNotification(notification.id)}
      >
        <XIcon />
      </Button>
    </motion.div>
  );
}
