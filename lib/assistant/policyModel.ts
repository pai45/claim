import type { PolicyCategory } from "@/features/policy/constants";
import { createAppDataPrompt, type GroundedAppData } from "./appData";
import { createPolicyPrompt } from "./policy";
import type {
  ModelPromptMessage,
  PolicyModelRequest,
  PolicyModelResponse,
} from "./policyModelTypes";

type PendingRequest = {
  resolve: (answer: string) => void;
  reject: (error: Error) => void;
  onProgress?: (progress?: number, file?: string) => void;
  stallTimer: ReturnType<typeof setTimeout>;
  totalTimer: ReturnType<typeof setTimeout>;
};

const MODEL_STALL_TIMEOUT_MS = 30_000;
const MODEL_TOTAL_TIMEOUT_MS = 180_000;
let worker: Worker | undefined;
let workerFailed = false;
const pendingRequests = new Map<string, PendingRequest>();

function clearRequestTimers(pending: PendingRequest) {
  clearTimeout(pending.stallTimer);
  clearTimeout(pending.totalTimer);
}

function rejectPending(error: Error) {
  for (const pending of pendingRequests.values()) {
    clearRequestTimers(pending);
    pending.reject(error);
  }
  pendingRequests.clear();
}

function markWorkerFailed(message: string) {
  workerFailed = true;
  worker?.terminate();
  worker = undefined;
  rejectPending(new Error(message));
}

function failTimedOutRequest(requestId: string, message: string) {
  const pending = pendingRequests.get(requestId);
  if (!pending) return;

  pendingRequests.delete(requestId);
  clearRequestTimers(pending);
  pending.reject(new Error(message));
  markWorkerFailed(message);
}

function resetStallTimer(requestId: string) {
  const pending = pendingRequests.get(requestId);
  if (!pending) return;

  clearTimeout(pending.stallTimer);
  pending.stallTimer = setTimeout(() => {
    failTimedOutRequest(
      requestId,
      "The on-device AI download stopped making progress.",
    );
  }, MODEL_STALL_TIMEOUT_MS);
}

function getWorker(): Worker {
  if (worker) return worker;

  worker = new Worker(new URL("./policy.worker.ts", import.meta.url), {
    type: "module",
    name: "policy-assistant",
  });

  worker.addEventListener(
    "message",
    (event: MessageEvent<PolicyModelResponse>) => {
      const message = event.data;
      const pending = pendingRequests.get(message.requestId);
      if (!pending) return;

      if (message.type === "progress") {
        resetStallTimer(message.requestId);
        pending.onProgress?.(message.progress, message.file);
        return;
      }

      pendingRequests.delete(message.requestId);
      clearRequestTimers(pending);
      if (message.type === "result") {
        pending.resolve(message.answer);
      } else {
        pending.reject(new Error(message.message));
        markWorkerFailed(message.message);
      }
    },
  );

  worker.addEventListener("error", () => {
    markWorkerFailed("The on-device policy model is unavailable.");
  });

  worker.addEventListener("messageerror", () => {
    markWorkerFailed("The on-device policy model could not be loaded.");
  });

  return worker;
}

export function supportsOnDevicePolicyModel(): boolean {
  if (workerFailed || typeof window === "undefined" || typeof Worker === "undefined") {
    return false;
  }

  return "gpu" in navigator;
}

function generateOnDeviceAnswer(
  messages: ModelPromptMessage[],
  onProgress?: (progress?: number, file?: string) => void,
): Promise<string> {
  if (!supportsOnDevicePolicyModel()) {
    return Promise.reject(
      new Error("WebGPU is not available on this browser or device."),
    );
  }

  const requestId = crypto.randomUUID();
  const request: PolicyModelRequest = {
    type: "generate",
    requestId,
    messages,
  };

  return new Promise((resolve, reject) => {
    const stallTimer = setTimeout(() => {
      failTimedOutRequest(
        requestId,
        "The on-device AI download did not start in time.",
      );
    }, MODEL_STALL_TIMEOUT_MS);
    const totalTimer = setTimeout(() => {
      failTimedOutRequest(
        requestId,
        "The on-device AI model took too long to load.",
      );
    }, MODEL_TOTAL_TIMEOUT_MS);
    pendingRequests.set(requestId, {
      resolve,
      reject,
      onProgress,
      stallTimer,
      totalTimer,
    });

    try {
      getWorker().postMessage(request);
    } catch (error) {
      const pending = pendingRequests.get(requestId);
      pendingRequests.delete(requestId);
      if (pending) clearRequestTimers(pending);
      reject(
        error instanceof Error
          ? error
          : new Error("The policy model request could not be started."),
      );
    }
  });
}

export function generatePolicyAnswer(
  question: string,
  policy: PolicyCategory,
  onProgress?: (progress?: number, file?: string) => void,
): Promise<string> {
  return generateOnDeviceAnswer(
    createPolicyPrompt(question, policy),
    onProgress,
  );
}

export function generateAppDataAnswer(
  question: string,
  source: GroundedAppData,
  onProgress?: (progress?: number, file?: string) => void,
): Promise<string> {
  return generateOnDeviceAnswer(
    createAppDataPrompt(question, source),
    onProgress,
  );
}
