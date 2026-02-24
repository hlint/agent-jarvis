import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactJson from "react-json-view";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import JarvisMarkdown from "./markdown";
import StatusIcon from "./StatusIcon";

export default function InfoCard({
  brief = "No Brief",
  status,
  data,
  content,
  icon,
  tag,
}: {
  brief?: string;
  status?: "pending" | "completed" | "failed";
  data?: Record<string, any>;
  content?: string;
  icon?: React.ReactNode;
  tag?: string;
}) {
  const [jsonExpanded, setJsonExpanded] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  // Scroll to bottom when jsonExpanded is false immediately
  useEffect(() => {
    if (!jsonExpanded && preRef.current) {
      preRef.current?.scrollTo({
        top: preRef.current?.scrollHeight,
      });
    }
  }, [jsonExpanded]);

  // Scroll to bottom when content changes and jsonExpanded is false
  useEffect(() => {
    if (!jsonExpanded && content && preRef.current) {
      setTimeout(() => {
        preRef.current?.scrollTo({
          top: preRef.current?.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [content, jsonExpanded]);

  const HeaderComponent = data || content ? "button" : "div";
  const headerProps =
    data || content
      ? {
          onClick: () => setJsonExpanded((v) => !v),
          "aria-label": jsonExpanded ? "Show less" : "Show more",
          className: cn(
            "group flex flex-row gap-2 items-center hover:bg-background/60 p-1 transition-colors w-full text-left cursor-pointer",
            jsonExpanded && "bg-background border-b",
          ),
        }
      : {
          className: "flex flex-row gap-2 items-center border-b px-1",
        };

  return (
    <div
      className={cn(
        "rounded-md text-sm text-muted-foreground overflow-hidden max-w-[90%]",
        jsonExpanded && "border bg-background",
      )}
    >
      <HeaderComponent {...headerProps}>
        <StatusIcon status={status}>{icon}</StatusIcon>
        <span className="min-w-0 truncate">{brief || "No Brief"}</span>
        {tag && (
          <Badge variant="outline" className="shrink-0">
            {tag}
          </Badge>
        )}
        {data || content ? (
          jsonExpanded ? (
            <ChevronUpIcon className="size-4 ml-auto shrink-0 text-muted-foreground transition-opacity group-hover:opacity-100 opacity-100" />
          ) : (
            <ChevronDownIcon className="size-4 ml-auto shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          )
        ) : null}
      </HeaderComponent>
      {data || content ? (
        <>
          {!jsonExpanded && content ? (
            <div className="">
              <pre
                ref={preRef}
                className="text-xs leading-relaxed whitespace-pre-wrap font-mono m-0 px-1"
                style={{
                  height: "3em", // Approximately 2 lines
                  lineHeight: "1.5em",
                  overflowY: "hidden",
                  overflowX: "hidden",
                }}
              >
                {content}
              </pre>
            </div>
          ) : null}
          <div
            className="grid transition-[grid-template-rows] duration-200 ease-out"
            style={{ gridTemplateRows: jsonExpanded ? "1fr" : "0fr" }}
          >
            <div className="min-h-0 overflow-hidden">
              <div className={content ? "flex flex-col gap-2 p-2" : "p-2"}>
                {content ? (
                  <div className="min-w-0">
                    <JarvisMarkdown
                      text={content}
                      className="text-xs/relaxed"
                    />
                  </div>
                ) : null}
                {data ? (
                  <div className={content ? "overflow-auto" : ""}>
                    <ReactJson
                      src={data}
                      collapsed={2}
                      theme="monokai"
                      style={{ backgroundColor: "transparent" }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
