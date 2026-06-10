import type { UserMessage } from "@repo/shared/defines/message";
import { smartTimeFormat } from "@repo/shared/lib/time";
import {
  CheckIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PaperclipIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
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
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import JarvisMarkdown from "../../components/markdown";
import useJarvisStore from "../../hooks/use-jarvis-store";

function attachmentHref(filePath: string) {
  return `/jarvis/file?path=${encodeURIComponent(filePath)}`;
}

function attachmentDisplayName(filePath: string) {
  const segment = filePath.split(/[/\\]/).pop();
  return segment || filePath;
}

export default function JarvisUserMessage({
  id,
  content,
  createdAt,
  attachments,
}: UserMessage) {
  const [copied, setCopied] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMessagesFrom = useJarvisStore(
    (state) => state.deleteMessagesFrom,
  );
  const sessionStatus = useJarvisStore(
    (state) => state.currentSession?.status ?? "idle",
  );
  const isRunning = sessionStatus !== "idle";
  const hasContent = !!content.trim();
  const hasAttachments = !!attachments?.length;

  const handleCopy = async () => {
    if (!hasContent) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable; keep copy icon state unchanged.
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteOpen(false);
    await deleteMessagesFrom(id);
  };

  return (
    <>
      <div className="flex w-full min-w-0 max-w-full flex-col items-end gap-3">
        <div className="min-w-0 max-w-full rounded-xl border border-border bg-muted/50 p-3">
          {hasContent && <JarvisMarkdown text={content} />}
          {hasAttachments && (
            <div
              className={
                hasContent
                  ? "mt-2 flex flex-col gap-1 border-t border-foreground/10 pt-2"
                  : "flex flex-col gap-1"
              }
            >
              {attachments.map((filePath) => (
                <a
                  key={filePath}
                  href={attachmentHref(filePath)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-w-0 max-w-full items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
                >
                  <PaperclipIcon className="size-3.5 shrink-0 opacity-70" />
                  <span className="truncate">
                    {attachmentDisplayName(filePath)}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <span className="text-xs text-muted-foreground">
            {smartTimeFormat(createdAt)}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={buttonVariants({
                variant: "ghost",
                size: "icon-xs",
              })}
              aria-label="Message actions"
            >
              {copied ? (
                <CheckIcon className="size-3" />
              ) : (
                <MoreHorizontalIcon className="size-3" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="top"
              sideOffset={4}
              className="w-auto"
            >
              <DropdownMenuItem
                className="whitespace-nowrap"
                disabled={!hasContent}
                onClick={handleCopy}
              >
                <CopyIcon />
                Copy text
              </DropdownMenuItem>
              <DropdownMenuItem
                className="whitespace-nowrap"
                variant="destructive"
                disabled={isRunning}
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2Icon />
                Delete from here
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete messages</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete this message and all messages after it in this
              conversation. This action cannot be undone.
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
