export type ModelPromptMessage = {
  role: "system" | "user";
  content: string;
};

export type PolicyModelRequest = {
  type: "generate";
  requestId: string;
  messages: ModelPromptMessage[];
};

export type PolicyModelResponse =
  | {
      type: "progress";
      requestId: string;
      progress?: number;
      file?: string;
    }
  | { type: "result"; requestId: string; answer: string }
  | { type: "error"; requestId: string; message: string };
