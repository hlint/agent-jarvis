import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useEffect, useState } from "react";
import ReactJson from "react-json-view";
import JarvisMarkdown from "./markdown";
import StatusIcon from "./StatusIcon";

export default function InfoCard({
  brief,
  status,
  data,
  content,
  icon,
}: {
  brief: string;
  status?: "pending" | "completed" | "failed";
  data?: Record<string, any>;
  content?: string;
  icon?: React.ReactNode;
}) {
  const [jsonExpanded, setJsonExpanded] = useState(true);
  useEffect(() => {
    if (status === "completed") {
      setJsonExpanded(false);
    }
  }, [status]);
  const HeaderComponent = data || content ? "button" : "div";
  const headerProps =
    data || content
      ? {
          onClick: () => setJsonExpanded((v) => !v),
          "aria-label": jsonExpanded ? "Show less" : "Show more",
          className:
            "flex flex-row gap-2 items-center border-b p-1 bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors w-full text-left",
        }
      : {
          className:
            "flex flex-row gap-2 items-center border-b p-1 bg-muted/40",
        };

  return (
    <div className="rounded-md border text-sm text-muted-foreground overflow-hidden">
      <HeaderComponent {...headerProps}>
        <StatusIcon status={status}>{icon}</StatusIcon>
        <span className="min-w-0 flex-1 truncate">{brief || "No Brief"}</span>
        {data || content ? (
          jsonExpanded ? (
            <ChevronUpIcon className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
          )
        ) : null}
      </HeaderComponent>
      {data || content ? (
        <div
          className="grid transition-[grid-template-rows] duration-200 ease-out"
          style={{ gridTemplateRows: jsonExpanded ? "1fr" : "0fr" }}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={content ? "grid grid-cols-[3fr_2fr] gap-2 p-2" : "p-2"}
            >
              {content ? (
                <div className="min-w-0 overflow-auto">
                  <JarvisMarkdown text={content} className="text-xs/relaxed" />
                </div>
              ) : null}
              {data ? (
                <div
                  className={content ? "min-w-0 shrink-0 overflow-auto" : ""}
                >
                  <ReactJson src={data} collapsed={2} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
