/// <reference lib="webworker" />

import {
  pipeline,
  type TextGenerationPipeline,
  type ProgressInfo,
} from "@huggingface/transformers";
import type {
  PolicyModelRequest,
  PolicyModelResponse,
} from "./policyModelTypes";

const MODEL_ID = "onnx-community/Qwen3-0.6B-ONNX";
const MODEL_REVISION = "a7b503b1c3f7e98e8f80b6d565f47807a5007d9c";
const workerScope = self as unknown as DedicatedWorkerGlobalScope;

let runtimePromise: Promise<TextGenerationPipeline> | undefined;

function post(message: PolicyModelResponse) {
  workerScope.postMessage(message);
}

function progressForRequest(requestId: string) {
  return (info: ProgressInfo) => {
    if (info.status === "progress_total") {
      post({
        type: "progress",
        requestId,
        progress: Math.round(info.progress),
      });
      return;
    }

    if (info.status === "progress") {
      post({
        type: "progress",
        requestId,
        progress: Math.round(info.progress),
        file: info.file,
      });
      return;
    }

    if (info.status === "download" || info.status === "initiate") {
      post({ type: "progress", requestId, file: info.file });
    }
  };
}

function loadRuntime(requestId: string) {
  if (!runtimePromise) {
    runtimePromise = pipeline("text-generation", MODEL_ID, {
      revision: MODEL_REVISION,
      dtype: "q4f16",
      device: "webgpu",
      progress_callback: progressForRequest(requestId),
    });
  }

  return runtimePromise;
}

function stripThinking(value: string): string {
  return value
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<\/?(?:think|answer)>/gi, "")
    .trim();
}

async function generateAnswer(request: PolicyModelRequest) {
  const generator = await loadRuntime(request.requestId);
  const output = await generator(request.messages, {
    max_new_tokens: 140,
    do_sample: false,
    tokenizer_encode_kwargs: { enable_thinking: false },
  });
  const generated = output[0]?.generated_text;
  const answer = Array.isArray(generated)
    ? generated.at(-1)?.content
    : generated;

  if (typeof answer !== "string" || !answer) {
    throw new Error("The policy model returned an unsupported response.");
  }

  return stripThinking(answer);
}

workerScope.addEventListener("message", (event: MessageEvent<PolicyModelRequest>) => {
  const request = event.data;
  if (request.type !== "generate") return;

  void generateAnswer(request)
    .then((answer) => {
      post({ type: "result", requestId: request.requestId, answer });
    })
    .catch((error: unknown) => {
      runtimePromise = undefined;
      post({
        type: "error",
        requestId: request.requestId,
        message:
          error instanceof Error
            ? error.message
            : "The on-device policy model could not start.",
      });
    });
});

export {};
