import type { PolicyTabId } from "@/features/policy/constants";
import type {
  AssistantGenerateRequest,
  AssistantStreamEvent,
  AssistantTurn,
} from "./assistantApiTypes";
import type { AppDataResolution } from "./appData";
import { parseAssistantRoute, type AssistantRoute } from "./route";

type ProgressCallback = (progress?: number, file?: string) => void;

/**
 * Null until the first call resolves. Set to false when the backend answers
 * with a non-2xx (the static Pages export has no `/api/assistant`), so we stop
 * paying for a request that can only fail.
 */
let backendAvailable: boolean | null = null;

function assistantApiUrl() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  // next.config sets trailingSlash: true, so the route handler lives at …/assistant/
  return `${basePath}/api/assistant/`;
}

async function generateViaBackend(
  request: AssistantGenerateRequest,
  onProgress?: ProgressCallback,
): Promise<string> {
  let response: Response;
  try {
    response = await fetch(assistantApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch (error) {
    backendAvailable = false;
    throw error;
  }

  if (!response.ok) {
    // A 4xx/5xx from a served route is a bad request, not a missing backend —
    // only treat "not routed here at all" as the static-host signal.
    if (response.status === 404 || response.status === 405) {
      backendAvailable = false;
    }
    throw new Error(
      `Assistant API unavailable (${response.status}). Run the app with npm run dev or npm start.`,
    );
  }

  backendAvailable = true;

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

/**
 * Backend AI is available whenever the app is served by Next.js. On the static
 * Pages export the first call fails and every later call short-circuits.
 */
export function supportsOnDevicePolicyModel(): boolean {
  return typeof window !== "undefined" && backendAvailable !== false;
}

export function resetAssistantBackendAvailability() {
  backendAvailable = null;
}

export function generatePolicyAnswer(
  question: string,
  categoryIds: PolicyTabId[],
  history?: AssistantTurn[],
  onProgress?: ProgressCallback,
): Promise<string> {
  return generateViaBackend(
    { type: "policy", question, categoryIds, history },
    onProgress,
  );
}

export function generateAppDataAnswer(
  question: string,
  resolution: AppDataResolution,
  history?: AssistantTurn[],
  onProgress?: ProgressCallback,
): Promise<string> {
  return generateViaBackend(
    { type: "appData", question, resolution, history },
    onProgress,
  );
}

/** Returns null when the model replies with something that isn't a valid route. */
export async function generateAssistantRoute(
  question: string,
  history?: AssistantTurn[],
  onProgress?: ProgressCallback,
): Promise<AssistantRoute | null> {
  const raw = await generateViaBackend(
    { type: "route", question, history },
    onProgress,
  );
  return parseAssistantRoute(raw);
}
