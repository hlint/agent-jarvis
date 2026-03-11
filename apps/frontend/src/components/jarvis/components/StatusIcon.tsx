import { CheckIcon, Loader2Icon, TriangleAlertIcon } from "lucide-react";

export default function StatusIcon({
  status = "completed",
  children,
}: {
  status?: "pending" | "completed" | "failed";
  children?: React.ReactNode;
}) {
  const icon = (() => {
    if (status === "failed") {
      return <TriangleAlertIcon className="size-4" />;
    }
    if (status === "completed") {
      return children ?? <CheckIcon className="size-4" />;
    }
    return <Loader2Icon className="size-4 animate-spin" />;
  })();
  return (
    <div className="flex items-center justify-center shrink-0 min-h-6">
      {icon}
    </div>
  );
}
