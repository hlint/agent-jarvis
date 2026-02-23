import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { Button } from "../../ui/button";

export default function ButtonClearHistory() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        title="Clear chat history"
        size="icon-lg"
        onClick={() => setOpen(true)}
      >
        <TrashIcon />
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages in this conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                api.jarvis["dialog-history"].delete();
                setOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
