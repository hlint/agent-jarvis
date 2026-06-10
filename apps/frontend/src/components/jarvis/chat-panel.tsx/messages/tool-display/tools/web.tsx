import type { JSONValue } from "@repo/shared/defines/miscs";
import { Badge } from "@/components/ui/badge";
import { LinkIcon, SearchIcon } from "lucide-react";
import type { ToolBadgeDescriptor } from "../badges/types";
import ToolSection from "../primitives/section";
import {
  asRecord,
  clampBadgeLabel,
  formatBadgeObject,
  getArrayField,
  getStringField,
  normalizeBadgeText,
  pickWebSnippet,
  shortUrl,
  type ToolRecord,
  truncateLines,
} from "../utils";

export function resolveWebSearchToolBadge(
  input: ToolRecord,
): ToolBadgeDescriptor {
  const query = getStringField(input, "query");
  return {
    icon: SearchIcon,
    label: clampBadgeLabel(
      formatBadgeObject(query ? normalizeBadgeText(query) : null, "Search"),
    ),
  };
}

export function resolveWebExtractToolBadge(
  input: ToolRecord,
): ToolBadgeDescriptor {
  const urls = getArrayField(input, "urls") ?? [];
  const stringUrls = urls.filter((url): url is string => typeof url === "string");
  const object =
    stringUrls.length > 1
      ? `${stringUrls.length} URLs`
      : stringUrls[0]
        ? shortUrl(stringUrls[0])
        : null;
  return {
    icon: LinkIcon,
    label: clampBadgeLabel(formatBadgeObject(object, "Extract")),
  };
}

function WebResultCard({
  title,
  url,
  snippet,
}: {
  title: string;
  url: string | null;
  snippet: string;
}) {
  const preview = truncateLines(snippet.trim(), 2);

  return (
    <div className="rounded-md border border-border/60 bg-muted/20 px-2 py-1.5 text-xs">
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary hover:underline line-clamp-1"
        >
          {title}
        </a>
      ) : (
        <p className="font-medium line-clamp-1">{title}</p>
      )}
      {preview ? (
        <p className="mt-1 text-muted-foreground line-clamp-2 whitespace-pre-wrap">
          {preview}
        </p>
      ) : null}
    </div>
  );
}

function renderWebResults(output: JSONValue): React.ReactNode {
  if (typeof output === "string") {
    return <p className="text-xs text-muted-foreground">{output}</p>;
  }

  const record = asRecord(output);
  if (!record) return null;

  const results = getArrayField(record, "results");
  if (results?.length) {
    return (
      <div className="flex flex-col gap-2">
        {results.map((item, index) => {
          const row = asRecord(item);
          if (!row) return null;
          const { title, url, snippet } = pickWebSnippet(row);
          return (
            <WebResultCard
              key={`${url ?? title}-${index}`}
              title={title}
              url={url}
              snippet={snippet}
            />
          );
        })}
      </div>
    );
  }

  if (Array.isArray(output)) {
    return (
      <div className="flex flex-col gap-2">
        {output.map((item, index) => {
          const row = asRecord(item);
          if (!row) return null;
          const { title, url, snippet } = pickWebSnippet(row);
          return (
            <WebResultCard
              key={`${url ?? title}-${index}`}
              title={title}
              url={url}
              snippet={snippet}
            />
          );
        })}
      </div>
    );
  }

  return null;
}

export default function WebSearchToolDisplay({
  input,
  output,
  showOutput,
  engine,
}: {
  input: ToolRecord;
  output: JSONValue;
  showOutput: boolean;
  engine: "tavily" | "searxng";
}) {
  const query = getStringField(input, "query");
  const topic = getStringField(input, "topic");

  return (
    <>
      <ToolSection label="Input">
        <p className="text-sm font-medium">{query ?? "(empty)"}</p>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline">{engine}</Badge>
          {topic ? <Badge variant="outline">{topic}</Badge> : null}
        </div>
      </ToolSection>
      {showOutput ? (
        <ToolSection label="Output">{renderWebResults(output)}</ToolSection>
      ) : null}
    </>
  );
}

export function WebExtractToolDisplay({
  input,
  output,
  showOutput,
}: {
  input: ToolRecord;
  output: JSONValue;
  showOutput: boolean;
}) {
  const urls = getArrayField(input, "urls") ?? [];

  return (
    <>
      <ToolSection label="Input">
        <ul className="flex flex-col gap-1">
          {urls.map((url) =>
            typeof url === "string" ? (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline break-all"
                >
                  {url}
                </a>
              </li>
            ) : null,
          )}
        </ul>
      </ToolSection>
      {showOutput ? (
        <ToolSection label="Output">{renderWebResults(output)}</ToolSection>
      ) : null}
    </>
  );
}
