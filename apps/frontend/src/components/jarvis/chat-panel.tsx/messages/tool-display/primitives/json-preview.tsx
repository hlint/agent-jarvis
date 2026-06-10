import { useTheme } from "next-themes";
import ReactJson from "react-json-view";
import { cn } from "@/lib/utils";

export default function JsonPreview({
  data,
  className,
  collapsed = 2,
}: {
  data: object;
  className?: string;
  collapsed?: number | boolean;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <div className={cn("max-h-48 overflow-auto rounded-md", className)}>
      <ReactJson
        src={data}
        collapsed={collapsed}
        theme={resolvedTheme === "dark" ? "monokai" : "rjv-default"}
        displayDataTypes={false}
        displayObjectSize={false}
        enableClipboard={false}
        name={false}
        style={{ backgroundColor: "transparent", fontSize: "11px" }}
      />
    </div>
  );
}
