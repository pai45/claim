import type { AppDataResolution } from "./appData";
import type { PolicyTabId } from "@/features/policy/constants";

export type AssistantGenerateRequest =
  | {
      type: "policy";
      question: string;
      categoryId: PolicyTabId;
    }
  | {
      type: "appData";
      question: string;
      resolution: AppDataResolution;
    };

export type AssistantStreamEvent =
  | { type: "progress"; progress?: number; file?: string }
  | { type: "result"; answer: string }
  | { type: "error"; message: string };
