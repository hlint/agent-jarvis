import type { RequestConfirmationChatEvent } from "@repo/shared/defines/chat-event";
import { CheckCircleIcon, Loader2Icon, XCircleIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "../ui/button";

const STATUS_META: Record<
  RequestConfirmationChatEvent["status"],
  { label: string; icon: ReactNode; tone: string }
> = {
  pending: {
    label: "Waiting for user confirmation",
    icon: <Loader2Icon className="size-4 animate-spin" />,
    tone: "text-amber-700",
  },
  confirmed: {
    label: "User approved",
    icon: <CheckCircleIcon className="size-4 text-emerald-600" />,
    tone: "text-emerald-700",
  },
  rejected: {
    label: "User rejected",
    icon: <XCircleIcon className="size-4 text-rose-600" />,
    tone: "text-rose-700",
  },
};

type Props = RequestConfirmationChatEvent;

export default function JarvisRequestConfirmation({
  id,
  brief,
  status,
}: Props) {
  const [submitting, setSubmitting] = useState<null | "confirm" | "reject">(
    null,
  );

  const handleDecision = async (decision: "confirm" | "reject") => {
    try {
      setSubmitting(decision);
      const response = await api.jarvis["request-confirmations"].post({
        id,
        decision,
      });
      if (!response.data?.success) {
        throw new Error(response.data?.error || "failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit confirmation, please try again.");
    } finally {
      setSubmitting(null);
    }
  };

  const statusMeta = STATUS_META[status];

  return (
    <div className="rounded-lg border px-4 py-3 text-sm text-amber-900 ">
      <div className="flex items-center gap-2 font-medium">
        <span className="uppercase tracking-wide text-xs text-amber-600">
          Confirmation Required
        </span>
        <span className="text-base text-amber-900">{brief}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 text-sm ${statusMeta.tone}`}
        >
          {statusMeta.icon}
          {statusMeta.label}
        </span>
        {status === "pending" ? (
          <div className="ml-auto flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={submitting !== null}
              onClick={() => handleDecision("reject")}
            >
              {submitting === "reject" ? (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              ) : (
                <XCircleIcon className="mr-2 size-4" />
              )}
              Reject
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={submitting !== null}
              onClick={() => handleDecision("confirm")}
            >
              {submitting === "confirm" ? (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              ) : (
                <CheckCircleIcon className="mr-2 size-4" />
              )}
              Approve
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
