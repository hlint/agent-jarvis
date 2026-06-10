import type { SessionListItem } from "@repo/shared/defines/session";
import { smartTimeFormat } from "@repo/shared/lib/time";
import { Trash2Icon, XIcon } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import useJarvisStore from "../hooks/use-jarvis-store";
import { filterSessionList } from "../lib/filter-session-list";
import JarvisSidebarSearch from "./search";

export default function JarvisSidebarRecentList() {
  const [searchQuery, setSearchQuery] = useState("");
  const sessionList = useJarvisStore((state) => state.sessionList);

  const filteredSessions = useMemo(
    () => filterSessionList(sessionList, searchQuery),
    [searchQuery, sessionList],
  );

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="sticky top-0 z-20 bg-background pb-2">
        <JarvisSidebarSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      {filteredSessions.length === 0 ? (
        isSearching ? (
          <div className="px-2 py-4 text-center text-xs text-muted-foreground">
            No matching conversations
          </div>
        ) : null
      ) : (
        filteredSessions.map((session, index) => {
          const previousSession = filteredSessions[index - 1];
          const showTimestampSeparator =
            !isSearching &&
            (!previousSession?.createdAt ||
              previousSession.createdAt - session.createdAt >
                1000 * 60 * 60 * 48);

          return (
            <Fragment key={session.id}>
              {showTimestampSeparator && (
                <TimestampSeparator timestamp={session.createdAt} />
              )}
              <JarvisSidebarRecentListItem session={session} />
            </Fragment>
          );
        })
      )}
    </div>
  );
}

function JarvisSidebarRecentListItem({
  session,
}: {
  session: SessionListItem;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const currentSessionId = useJarvisStore((state) => state.currentSessionId);
  const switchSession = useJarvisStore((state) => state.switchSession);
  const deleteSession = useJarvisStore((state) => state.deleteSession);
  const isMobileMode = useJarvisStore((state) => state.isMobileMode);
  const isActive = currentSessionId === session.id;
  const isRunning = session.status !== "idle";

  const handleConfirmDelete = async () => {
    setDeleteOpen(false);
    await deleteSession(session.id);
  };

  return (
    <>
      <div
        className={cn(
          "group flex w-full flex-row items-center gap-1 rounded-md px-1 py-1 transition-colors",
          isActive
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        )}
      >
        <button
          type="button"
          className="min-w-0 flex-1 cursor-pointer rounded-sm px-1 py-0.5 text-left"
          onClick={() => switchSession(session.id)}
        >
          <div className="truncate text-sm font-medium">
            {session.name || "Untitled"}
          </div>
        </button>

        {isRunning ? (
          <Tooltip>
            <TooltipTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-xs" }),
                "shrink-0 transition-opacity",
                isMobileMode
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100",
              )}
              disabled
              aria-label="Delete conversation"
            >
              <Trash2Icon />
            </TooltipTrigger>
            <TooltipContent side="top">
              Cannot delete while the conversation is running
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn(
              "shrink-0 transition-opacity",
              isMobileMode
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100",
            )}
            aria-label="Delete conversation"
            onClick={() => setDeleteOpen(true)}
          >
            <XIcon />
          </Button>
        )}
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation</AlertDialogTitle>
            <AlertDialogDescription>
              This conversation will be moved to the recycle bin and cannot be
              restored.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function TimestampSeparator({ timestamp }: { timestamp: number }) {
  return (
    <div className="pt-2 pl-2 text-xs text-muted-foreground/70">
      {smartTimeFormat(timestamp)}
    </div>
  );
}
