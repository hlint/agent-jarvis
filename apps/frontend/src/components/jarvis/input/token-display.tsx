import { Badge } from "@/components/ui/badge";
import useJarvisStore from "../use-jarvis-store";

export default function TokenDisplay() {
  const dialogHistory = useJarvisStore((state) => state.dialogHistory);
  const lastThinkEntry = dialogHistory
    .filter((entry) => entry.role === "agent-thinking")
    .at(-1);
  const inputTokens = lastThinkEntry?.inputTokens;
  if (!inputTokens) return null;
  return (
    <Badge variant="secondary" title="Context Window Tokens">
      {formatTokens(inputTokens)}
    </Badge>
  );
}

function formatTokens(tokens: number) {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
  return tokens.toLocaleString();
}
