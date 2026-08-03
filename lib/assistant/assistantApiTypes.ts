import type { AppDataResolution } from "./appData";
import type { PolicyTabId } from "@/features/policy/constants";

/** A prior chat turn, trimmed for prompt context. */
export type AssistantTurn = {
  role: "user" | "assistant";
  content: string;
};

export type AssistantGenerateRequest =
  | {
      type: "policy";
      question: string;
      categoryIds: PolicyTabId[];
      history?: AssistantTurn[];
    }
  | {
      type: "appData";
      question: string;
      resolution: AppDataResolution;
      history?: AssistantTurn[];
    }
  | {
      type: "route";
      question: string;
      history?: AssistantTurn[];
    };

export type AssistantStreamEvent =
  | { type: "progress"; progress?: number; file?: string }
  | { type: "result"; answer: string }
  | { type: "error"; message: string };
