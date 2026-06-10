import type { ModelMessage } from "ai";
import { compressVercelMessages } from "headroom-ai/vercel-ai";

/** User-turn blocks kept verbatim; older blocks are sent to Headroom /v1/compress. */
const DEFAULT_KEEP_USER_TURNS = 3;

export type CompressJarvisResult = {
  messages: ModelMessage[];
  compressed: boolean;
  archiveMessageCount: number;
  recentMessageCount: number;
  tokensSaved?: number;
};

/**
 * Compress only older dialog: the last {@link DEFAULT_KEEP_USER_TURNS} user turns
 * (and their assistant/tool follow-ups) stay intact so recent `headroom_retrieve`
 * results are never re-compressed.
 */
export async function compressJarvisModelMessages(
  messages: ModelMessage[],
  modelId: string,
): Promise<CompressJarvisResult> {
  const keepUserTurns = DEFAULT_KEEP_USER_TURNS;
  const { archive, recent } = splitModelMessagesByUserTurns(
    messages,
    keepUserTurns,
  );

  if (archive.length === 0) {
    return {
      messages,
      compressed: false,
      archiveMessageCount: 0,
      recentMessageCount: recent.length,
    };
  }

  const result = await compressVercelMessages(archive, { model: modelId });

  return {
    messages: [...result.messages, ...recent],
    compressed: result.compressed,
    archiveMessageCount: archive.length,
    recentMessageCount: recent.length,
    tokensSaved: result.tokensSaved,
  };
}

function splitModelMessagesByUserTurns(
  messages: ModelMessage[],
  keepUserTurns: number,
) {
  const userIndices: number[] = [];
  messages.forEach((message, index) => {
    if (message.role === "user") {
      userIndices.push(index);
    }
  });

  if (userIndices.length <= keepUserTurns) {
    return { archive: [] as ModelMessage[], recent: messages };
  }

  const splitAt = userIndices[userIndices.length - keepUserTurns] ?? 0;
  return {
    archive: messages.slice(0, splitAt),
    recent: messages.slice(splitAt),
  };
}
