export type ChatEvent =
  | AssistantChatEvent
  | UserChatEvent
  | ToolCallChatEvent
  | CronTaskTriggerChatEvent
  | ActionRoundChatEvent
  | DoubleCheckChatEvent;

export type DoubleCheckChatEvent = {
  id: string;
  role: "double-check";
  time: number;
};

export type ActionRoundChatEvent = {
  id: string;
  role: "action-round";
  round: number;
  time: number;
  pending: boolean;
};

export type AssistantChatEvent = {
  id: string;
  role: "assistant";
  time: number;
  content: string;
  pending: boolean;
};

export type UserChatEvent = {
  id: string;
  role: "user";
  time: number;
  content: string;
};

export type ToolCallChatEvent = {
  id: string;
  role: "tool-call";
  time: number;
  brief: string;
  toolName: string;
  toolInput: any;
  toolOutput: any;
  pending: boolean;
};

export type CronTaskTriggerChatEvent = {
  id: string;
  role: "cron-task-trigger";
  time: number;
  taskName: string;
  oneTimeTrigger: boolean;
  taskDescription: string;
  taskCronPattern: string;
};
