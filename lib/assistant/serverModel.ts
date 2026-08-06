import {
  pipeline,
  type ProgressInfo,
  type TextGenerationPipeline,
} from "@huggingface/transformers";
import { getPolicyCategory } from "@/features/policy/constants";
import { buildGroundedAppData, createAppDataPrompt } from "./appData";
import type { AssistantGenerateRequest } from "./assistantApiTypes";
import { createPolicyPrompt } from "./policy";
import { createRoutePrompt } from "./route";
import type { ModelPromptMessage } from "./policyModelTypes";

const MODEL_ID = "onnx-community/Qwen3-0.6B-ONNX";
const MODEL_REVISION = "a7b503b1c3f7e98e8f80b6d565f47807a5007d9c";

export type ServerModelProgress = {
  progress?: number;
  file?: string;
};

type ProgressCallback = (event: ServerModelProgress) => void;

type AssistantModelGlobal = typeof globalThis & {
  __ebClaimsAssistantPipeline?: Promise<TextGenerationPipeline>;
};

function progressHandler(onProgress?: ProgressCallback) {
  return (info: ProgressInfo) => {
    if (!onProgress) return;

    if (info.status === "progress_total") {
      onProgress({ progress: Math.round(info.progress) });
      return;
    }

    if (info.status === "progress") {
      onProgress({
        progress: Math.round(info.progress),
        file: info.file,
      });
      return;
    }

    if (info.status === "download" || info.status === "initiate") {
      onProgress({ file: info.file });
    }
  };
}

function loadRuntime(onProgress?: ProgressCallback) {
  const globals = globalThis as AssistantModelGlobal;
  // Survive Next.js route module reloads in dev so the ~570 MB model stays warm.
  if (!globals.__ebClaimsAssistantPipeline) {
    globals.__ebClaimsAssistantPipeline = pipeline("text-generation", MODEL_ID, {
      revision: MODEL_REVISION,
      // CPU-friendly quantized weights for the Node / onnxruntime-node path.
      dtype: "q4",
      device: "cpu",
      progress_callback: progressHandler(onProgress),
    });
  }

  return globals.__ebClaimsAssistantPipeline;
}

function stripThinking(value: string): string {
  return value
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<\/?(?:think|answer)>/gi, "")
    .trim();
}

function messagesForRequest(
  request: AssistantGenerateRequest,
): ModelPromptMessage[] {
  if (request.type === "route") {
    return createRoutePrompt(request.question, request.history);
  }

  if (request.type === "policy") {
    return createPolicyPrompt(
      request.question,
      request.categoryIds.map((id) => getPolicyCategory(id)),
      request.history,
    );
  }

  const source = buildGroundedAppData(request.resolution);
  return createAppDataPrompt(request.question, source, request.history);
}

/** Routing emits one small JSON object; answers need room for markdown. */
function maxNewTokensFor(request: AssistantGenerateRequest): number {
  return request.type === "route" ? 160 : 320;
}

export async function generateAssistantAnswer(
  request: AssistantGenerateRequest,
  onProgress?: ProgressCallback,
): Promise<string> {
  const messages = messagesForRequest(request);
  const generator = await loadRuntime(onProgress);
  const output = await generator(messages, {
    max_new_tokens: maxNewTokensFor(request),
    do_sample: false,
    tokenizer_encode_kwargs: { enable_thinking: false },
  });
  const generated = output[0]?.generated_text;
  const answer = Array.isArray(generated)
    ? generated.at(-1)?.content
    : generated;

  if (typeof answer !== "string" || !answer) {
    throw new Error("The assistant model returned an unsupported response.");
  }

  return stripThinking(answer);
}

export function resetAssistantModelForTests() {
  const globals = globalThis as AssistantModelGlobal;
  globals.__ebClaimsAssistantPipeline = undefined;
}
