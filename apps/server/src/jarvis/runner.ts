import { join } from "node:path";
import { streamTextOptions } from "@repo/shared/defines/constant";
import type {
  AssistantMessage,
  ChatMessage,
  UserMessage,
} from "@repo/shared/defines/message";
import type { JSONValue } from "@repo/shared/defines/miscs";
import type {
  RunResult,
  Session,
  SubagentRunInput,
  SubagentRunResult,
} from "@repo/shared/defines/session";
import { isPublicSession } from "@repo/shared/defines/session";
import {
  applySubagentSessionDetail,
  flattenSessionRounds,
  getAssistantOutput,
  getCurrentRound,
} from "@repo/shared/lib/session";
import { timeFormat } from "@repo/shared/lib/time";
import { shortId } from "@repo/shared/lib/utils";
import { streamText } from "ai";
import { cloneDeep } from "es-toolkit";
import fs from "fs-extra";
import { createLanguageModel } from "../lib/create-ai-model";
import { compressJarvisModelMessages } from "../lib/headroom";
import { chatMessagesToModelMessages } from "../lib/message";
import type Jarvis from ".";
import { DIR_SESSIONS } from "./defines";
import { clearSessionPlan, isPlanPhase } from "./plan";

const MAX_PLAN_PHASE_TOOL_RETRIES = 6;

function formatPlanPhaseDisallowedToolError(
  toolName: string,
  existingError?: unknown,
): string {
  const hint = `Tool "${toolName}" is not available in the plan phase. Call setup_plan first to unlock other tools, or reply with text only if no tools are needed.`;
  if (existingError == null || existingError === "") {
    return hint;
  }
  const existing =
    existingError instanceof Error
      ? existingError.message
      : String(existingError);
  return `${existing} ${hint}`;
}

function annotatePlanPhaseDisallowedToolErrors(
  assistantMessage: AssistantMessage,
): boolean {
  let hasDisallowed = false;
  for (const call of assistantMessage.toolCalls) {
    if (call.toolName === "setup_plan") {
      continue;
    }
    hasDisallowed = true;
    call.status = "failed";
    call.error = formatPlanPhaseDisallowedToolError(call.toolName, call.error);
  }
  return hasDisallowed;
}

/**
 * Plan-phase loop rules (first iteration after a user message, before setup_plan succeeds):
 * - Text-only reply → finish the turn (setup_plan is optional for simple answers).
 * - Tool calls → must be setup_plan only (enforced by tool availability; disallowed calls get toolCall.error).
 */
function resolveAgentLoopContinuation(
  session: Session,
  assistantMessage: AssistantMessage,
  planPhaseToolRetries: number,
): { looping: boolean; error?: string; planPhaseToolRetries: number } {
  const hadToolCalls = assistantMessage.toolCalls.length > 0;

  if (!hadToolCalls) {
    return { looping: false, planPhaseToolRetries };
  }

  if (isPlanPhase(session)) {
    const hasDisallowedTool =
      annotatePlanPhaseDisallowedToolErrors(assistantMessage);
    if (hasDisallowedTool) {
      if (planPhaseToolRetries >= MAX_PLAN_PHASE_TOOL_RETRIES) {
        return {
          looping: false,
          error:
            "Agent called tools other than setup_plan before creating the task board",
          planPhaseToolRetries,
        };
      }
      return {
        looping: true,
        planPhaseToolRetries: planPhaseToolRetries + 1,
      };
    }
  }

  return { looping: true, planPhaseToolRetries };
}

function isAborted(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }
  return error instanceof Error && error.name === "AbortError";
}

interface AgentLoopResult {
  aborted: boolean;
  error?: string;
}

export default class JarvisRunner {
  private readonly jarvis: Jarvis;
  private readonly abortControllers = new Map<string, AbortController>();

  constructor(jarvis: Jarvis) {
    this.jarvis = jarvis;
  }

  abort(sessionId: string) {
    const session = this.jarvis.session.getSession(sessionId);
    if (!session) {
      return {
        success: false,
        error: `Session ${sessionId} not found`,
        code: "not_found" as const,
      };
    }

    if (session.status === "stopping") {
      return { success: true };
    }

    if (session.status !== "running") {
      return {
        success: false,
        error: `Session ${sessionId} is not running`,
        code: "not_running" as const,
      };
    }

    session.status = "stopping";
    this.jarvis.session.sessionChanged(sessionId);
    if (isPublicSession(session)) {
      this.jarvis.session.sessionListUpdated();
    }

    this.abortControllers
      .get(sessionId)
      ?.abort(new DOMException("The user aborted the request.", "AbortError"));

    return { success: true };
  }

  async run(
    content: string,
    sessionId: string,
    attachments?: string[],
  ): Promise<RunResult> {
    const session = this.jarvis.session.getSession(sessionId);
    if (!session) {
      console.warn(`Session ${sessionId} not found`);
      return { success: false, error: `Session ${sessionId} not found` };
    }
    if (session.status !== "idle") {
      console.warn(`Session ${sessionId} is already processing`);
      return {
        success: false,
        error: `Session ${sessionId} is already processing`,
      };
    }
    const userMessage: UserMessage = {
      role: "user",
      content,
      id: shortId(),
      createdAt: Date.now(),
      createdTime: timeFormat(),
    };
    if (attachments?.length) {
      userMessage.attachments = attachments;
    }
    clearSessionPlan(session);
    session.rounds.push({
      id: userMessage.id,
      createdAt: userMessage.createdAt,
      messages: [userMessage],
    });
    this.jarvis.session.sessionChanged(sessionId);

    const loopResult = await this.agentLoop(session);
    const output = getAssistantOutput(session);

    if (loopResult.error) {
      return { success: false, error: loopResult.error, output };
    }
    if (loopResult.aborted) {
      return { success: false, error: "Aborted", output };
    }
    return { success: true, output };
  }

  async runSubagent(input: SubagentRunInput): Promise<SubagentRunResult> {
    const sessionDetail = input.sessionDetail ?? 0;
    const subSession = this.jarvis.session.createSession(input.sessionName, {
      type: "subagent-tool",
      parentSessionId: input.parentSessionId,
    });
    const toResponseSession = (session: Session) =>
      applySubagentSessionDetail(cloneDeep(session), sessionDetail);
    try {
      const result = await this.run(input.instruction, subSession.id);
      const session = this.jarvis.session.getSession(subSession.id);
      if (!session) {
        return {
          success: false,
          error: `Session ${subSession.id} not found after run`,
          output: result.output,
          session: toResponseSession(subSession),
        };
      }
      return {
        success: result.success,
        error: result.error,
        output: result.output,
        session: toResponseSession(session),
      };
    } finally {
      this.jarvis.session.deleteSession(subSession.id);
    }
  }

  private async agentLoop(session: Session): Promise<AgentLoopResult> {
    const provider = this.jarvis.config.getAiProvider("CHAT");
    if (!provider) {
      console.error("No provider found for CHAT");
      const round = getCurrentRound(session);
      round?.messages.push({
        role: "assistant",
        content:
          "I'm sorry, I'm not able to process your request due to the lack of a LLM provider. Please check your config.json file and make sure you have a provider configured for the CHAT duty.",
        id: shortId(),
        status: "failed",
        reasoning: "",
        toolCalls: [],
        createdAt: Date.now(),
        createdTime: timeFormat(),
      });
      this.jarvis.session.sessionChanged(session.id);
      return { aborted: false, error: "No LLM provider configured for CHAT" };
    }

    session.status = "running";
    const system = this.jarvis.prompt.getSystemPrompt();
    const abortController = new AbortController();
    this.abortControllers.set(session.id, abortController);
    this.jarvis.session.sessionChanged(session.id);
    if (isPublicSession(session)) {
      this.jarvis.session.sessionListUpdated();
    }

    let loopError: string | undefined;
    let aborted = false;
    let looping = true;
    let planPhaseToolRetries = 0;

    try {
      while (looping) {
        if (abortController.signal.aborted) {
          aborted = true;
          break;
        }

        const model = createLanguageModel(provider);
        const chatMessages: ChatMessage[] = flattenSessionRounds(
          session.rounds,
        );
        const modelMessages = chatMessagesToModelMessages(chatMessages);
        const { dialogMessages, tokensSaved } = await (async () => {
          if (this.jarvis.config.isWithComputer()) {
            const { messages: dialogMessages, tokensSaved } =
              await compressJarvisModelMessages(modelMessages, model.modelId);
            return { dialogMessages, tokensSaved };
          }
          return { dialogMessages: modelMessages, tokensSaved: 0 };
        })();
        await fs.writeJSON(
          join(DIR_SESSIONS, session.id, "messages.json"),
          dialogMessages,
          { spaces: 2 },
        );

        if (abortController.signal.aborted) {
          aborted = true;
          break;
        }

        const assistantMessage: AssistantMessage = {
          role: "assistant",
          content: "",
          id: shortId(),
          status: "pending",
          reasoning: "",
          toolCalls: [],
          createdAt: Date.now(),
          createdTime: timeFormat(),
        };
        const round = getCurrentRound(session);
        if (!round) break;
        round.messages.push(assistantMessage);
        this.jarvis.session.sessionChanged(session.id);

        let streamHandled = false;

        const { fullStream, totalUsage } = streamText({
          model,
          system,
          providerOptions: this.jarvis.config.getProviderOptions(),
          messages: [
            ...dialogMessages,
            {
              role: "system",
              content: this.jarvis.prompt.getRuntimePrompt(session, {
                disabledToolsPrompt:
                  this.jarvis.tool.getDisabledToolsPromptForPlanPhase(
                    session.id,
                  ),
              }),
            },
          ],
          tools: this.jarvis.tool.getTools(session.id),
          abortSignal: abortController.signal,
          ...streamTextOptions,
          onError: ({ error }) => {
            if (isAborted(error)) {
              return;
            }
            streamTextOptions.onError({ error });
          },
        });

        try {
          for await (const chunk of fullStream) {
            switch (chunk.type) {
              case "reasoning-delta":
                assistantMessage.reasoning += chunk.text;
                break;
              case "text-delta":
                assistantMessage.content += chunk.text;
                break;
              case "tool-input-start":
                assistantMessage.toolCalls.push({
                  id: chunk.id,
                  toolName: chunk.toolName,
                  toolInput: "",
                  toolOutput: null,
                  status: "pending",
                });
                break;
              case "tool-input-delta": {
                const toolCall = assistantMessage.toolCalls?.find(
                  (call) => call.id === chunk.id,
                );
                if (toolCall) {
                  toolCall.toolInput += chunk.delta;
                }
                break;
              }
              case "tool-input-end": {
                const toolCall = assistantMessage.toolCalls?.find(
                  (call) => call.id === chunk.id,
                );
                if (toolCall) {
                  toolCall.toolInput = JSON.parse(
                    toolCall.toolInput as string,
                  ) as JSONValue;
                }
                break;
              }
              case "tool-error": {
                const toolCall = assistantMessage.toolCalls?.find(
                  (call) => call.id === chunk.toolCallId,
                );
                if (toolCall) {
                  toolCall.status = "failed";
                  toolCall.error = chunk.error;
                }
                break;
              }
              case "tool-result": {
                const toolCall = assistantMessage.toolCalls?.find(
                  (call) => call.id === chunk.toolCallId,
                );
                if (toolCall) {
                  toolCall.toolOutput = chunk.output;
                  if (toolCall?.status === "pending") {
                    toolCall.status = "completed";
                  }
                }
                break;
              }
            }
            this.jarvis.session.sessionChanged(session.id);
          }

          if (abortController.signal.aborted) {
            this.finalizeAbortedAssistantMessage(assistantMessage);
            aborted = true;
            break;
          }

          assistantMessage.status = "completed";
          session.lastUsage = await totalUsage;
          session.lastUsage.tokensSavedByHeadroom = tokensSaved;
          streamHandled = true;

          const loopDecision = resolveAgentLoopContinuation(
            session,
            assistantMessage,
            planPhaseToolRetries,
          );
          planPhaseToolRetries = loopDecision.planPhaseToolRetries;
          looping = loopDecision.looping;
          if (loopDecision.error) {
            loopError = loopDecision.error;
            break;
          }
        } catch (streamError) {
          if (isAborted(streamError) || abortController.signal.aborted) {
            this.finalizeAbortedAssistantMessage(assistantMessage);
            aborted = true;
            break;
          }
          this.finalizeFailedAssistantMessage(assistantMessage, streamError);
          loopError =
            streamError instanceof Error
              ? streamError.message
              : "Agent loop failed";
          break;
        } finally {
          if (!streamHandled && assistantMessage.status === "pending") {
            this.finalizeFailedAssistantMessage(
              assistantMessage,
              loopError ?? "Stream ended before completion",
            );
          }
          this.jarvis.session.sessionChanged(session.id);
        }
      }
    } catch (error) {
      if (!abortController.signal.aborted && !isAborted(error)) {
        console.error(`Error in agentLoop:`, error);
        loopError =
          error instanceof Error ? error.message : "Agent loop failed";
      }
    } finally {
      this.abortControllers.delete(session.id);
      session.status = "idle";
      this.jarvis.session.sessionChanged(session.id);
      if (isPublicSession(session)) {
        this.jarvis.session.sessionListUpdated();
      }
    }

    if (loopError) {
      return { aborted: false, error: loopError };
    }
    return { aborted };
  }

  private finalizeFailedAssistantMessage(
    message: AssistantMessage,
    error: unknown,
  ) {
    if (message.status === "pending") {
      message.status = "failed";
    }

    if (!message.content.trim()) {
      message.content =
        error instanceof Error ? error.message : "Agent loop failed";
    }

    for (const toolCall of message.toolCalls) {
      if (toolCall.status === "pending") {
        toolCall.status = "failed";
        toolCall.error = error;
      }
    }
  }

  private finalizeAbortedAssistantMessage(message: AssistantMessage) {
    if (message.status === "pending") {
      message.status = "failed";
    }

    for (const toolCall of message.toolCalls) {
      if (toolCall.status === "pending") {
        toolCall.status = "failed";
        toolCall.error = "Aborted";
      }
    }
  }
}
