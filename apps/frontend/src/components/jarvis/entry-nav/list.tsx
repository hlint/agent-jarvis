import { smartTimeFormat } from "@repo/shared/lib/time";
import {
  BotIcon,
  FileIcon,
  InfoIcon,
  LightbulbIcon,
  PanelsTopLeft,
  UserIcon,
  WrenchIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import useJarvisStore from "../use-jarvis-store";

export default function JarvisEntryNavList() {
  const visibleDialogHistory = useJarvisStore(
    (state) => state.visibleDialogHistory,
  );
  return (
    <div className="flex flex-col gap-2">
      {visibleDialogHistory.map((item, index) => {
        let itemComponent = null;
        switch (item.role) {
          case "user":
            itemComponent = (
              <JarvisEntryNavListItem
                id={item.id}
                key={item.id}
                title={item.content}
                icon={<UserIcon className="size-4" />}
              />
            );
            break;
          case "agent-reply":
            itemComponent = (
              <JarvisEntryNavListItem
                id={item.id}
                key={item.id}
                title={item.content}
                icon={<BotIcon className="size-4" />}
              />
            );
            break;
          case "attachment":
            itemComponent = (
              <JarvisEntryNavListItem
                id={item.id}
                key={item.id}
                title={item.content}
                icon={<FileIcon className="size-4" />}
              />
            );
            break;
          case "html-view":
            itemComponent = (
              <JarvisEntryNavListItem
                id={item.id}
                key={item.id}
                title={item.title}
                icon={<PanelsTopLeft className="size-4" />}
              />
            );
            break;
          case "agent-tool-call":
            itemComponent = (
              <JarvisEntryNavListItem
                id={item.id}
                key={item.id}
                title={`${item.toolName}: ${item.brief}`}
                icon={<WrenchIcon className="size-4" />}
              />
            );
            break;
          case "system-event":
            itemComponent = (
              <JarvisEntryNavListItem
                id={item.id}
                key={item.id}
                title={item.content}
                icon={<InfoIcon className="size-4" />}
              />
            );
            break;
          case "agent-thinking":
            itemComponent = (
              <JarvisEntryNavListItem
                id={item.id}
                key={item.id}
                title={`Reasoning: ${item.content}`}
                icon={<LightbulbIcon className="size-4" />}
              />
            );
            break;
          default:
            itemComponent = null;
            break;
        }
        const previousItem = visibleDialogHistory[index - 1];
        let timestampSeparator = null;
        if (
          !previousItem?.createdAt ||
          item.createdAt - previousItem.createdAt > 1000 * 60 * 60 * 2
        ) {
          timestampSeparator = (
            <TimestampSeparator timestamp={item.createdAt} />
          );
        }
        return (
          <>
            {timestampSeparator}
            {itemComponent}
          </>
        );
      })}
    </div>
  );
}

function JarvisEntryNavListItem({
  id,
  title = "",
  icon,
}: {
  id: string;
  title?: string;
  icon?: ReactNode;
}) {
  const activeEntryId = useJarvisStore((state) => state.activeEntryId);
  const setActiveEntryId = useJarvisStore((state) => state.setActiveEntryId);
  const isActive = activeEntryId === id;

  const handleClick = () => {
    setActiveEntryId(id);
    const entryMessage = document.getElementById(`entry-message-${id}`);
    if (entryMessage) {
      entryMessage.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  return (
    <button
      type="button"
      className={cn(
        "flex flex-row gap-2 items-center cursor-pointer rounded-md px-2 py-1 -mx-2 transition-colors",
        isActive
          ? "text-foreground bg-muted"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
      )}
      onClick={handleClick}
    >
      <div className="shrink-0">{icon}</div>
      <div className="text-sm font-medium truncate">{title}</div>
    </button>
  );
}

function TimestampSeparator({ timestamp }: { timestamp: number }) {
  return (
    <div className="text-xs font-bold text-muted-foreground pt-2">
      {smartTimeFormat(timestamp)}
    </div>
  );
}
