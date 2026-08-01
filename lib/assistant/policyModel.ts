import type { PolicyTabId } from "@/features/policy/constants";
import type {
  AssistantGenerateRequest,
  AssistantStreamEvent,
} from "./assistantApiTypes";
import type { AppDataResolution } from "./appData";

type ProgressCallback = (progress?: number, file?: string) => void;

function assistantApiUrl() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  // next.config sets trailingSlash: true, so the route handler lives at …/assistant/
  return `${basePath}/api/assistant/`;
}

async function generateViaBackend(
  request: AssistantGenerateRequest,
  onProgress?: ProgressCallback,
): Promise<string> {
  const response = await fetch(assistantApiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(
      `Assistant API unavailable (${response.status}). Run the app with npm run dev or npm start.`,
    );
  }

  if (!response.body) {
    throw new Error("Assistant API returned an empty response.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer: string | undefined;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let event: AssistantStreamEvent;
      try {
        event = JSON.parse(trimmed) as AssistantStreamEvent;
      } catch {
        continue;
      }

      if (event.type === "progress") {
        onProgress?.(event.progress, event.file);
        continue;
      }

      if (event.type === "result") {
        answer = event.answer;
        continue;
      }

      if (event.type === "error") {
        throw new Error(event.message);
      }
    }
  }

  const trailing = buffer.trim();
  if (trailing) {
    try {
      const event = JSON.parse(trailing) as AssistantStreamEvent;
      if (event.type === "result") answer = event.answer;
      if (event.type === "error") throw new Error(event.message);
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
    }
  }

  if (!answer) {
    throw new Error("Assistant API finished without an answer.");
  }

  return answer;
}

/** Backend AI is available whenever the app is served by Next.js (not static Pages). */
export function supportsOnDevicePolicyModel(): boolean {
  return typeof window !== "undefined";
}

export function generatePolicyAnswer(
  question: string,
  categoryId: PolicyTabId,
  onProgress?: ProgressCallback,
): Promise<string> {
  return generateViaBackend(
    { type: "policy", question, categoryId },
    onProgress,
  );
}

export function generateAppDataAnswer(
  question: string,
  resolution: AppDataResolution,
  onProgress?: ProgressCallback,
): Promise<string> {
  return generateViaBackend(
    { type: "appData", question, resolution },
    onProgress,
  );
}
