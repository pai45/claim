import { NextResponse } from "next/server";
import {
  POLICY_CATEGORIES,
  type PolicyTabId,
} from "@/features/policy/constants";
import type {
  AssistantGenerateRequest,
  AssistantStreamEvent,
} from "@/lib/assistant/assistantApiTypes";
import type { AppDataResolution } from "@/lib/assistant/appData";
import { generateAssistantAnswer } from "@/lib/assistant/serverModel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const POLICY_TAB_IDS = new Set<string>(
  POLICY_CATEGORIES.map((category) => category.id),
);

function isPolicyTabId(value: unknown): value is PolicyTabId {
  return typeof value === "string" && POLICY_TAB_IDS.has(value);
}

function parseAppDataResolution(value: unknown): AppDataResolution | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  if (record.kind === "dashboard") {
    if (
      record.categoryId !== undefined &&
      !isPolicyTabId(record.categoryId)
    ) {
      return null;
    }
    return {
      kind: "dashboard",
      categoryId: isPolicyTabId(record.categoryId)
        ? record.categoryId
        : undefined,
    };
  }

  if (record.kind === "claims") {
    if (
      record.categoryId !== undefined &&
      !isPolicyTabId(record.categoryId)
    ) {
      return null;
    }
    if (
      record.status !== undefined &&
      record.status !== "Approved" &&
      record.status !== "Pending" &&
      record.status !== "Rejected"
    ) {
      return null;
    }
    return {
      kind: "claims",
      categoryId: isPolicyTabId(record.categoryId)
        ? record.categoryId
        : undefined,
      claimId: typeof record.claimId === "string" ? record.claimId : undefined,
      status:
        record.status === "Approved" ||
        record.status === "Pending" ||
        record.status === "Rejected"
          ? record.status
          : undefined,
    };
  }

  return null;
}

function parseRequest(body: unknown): AssistantGenerateRequest | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  if (typeof record.question !== "string" || !record.question.trim()) {
    return null;
  }

  const question = record.question.trim();

  if (record.type === "policy") {
    if (!isPolicyTabId(record.categoryId)) return null;
    return { type: "policy", question, categoryId: record.categoryId };
  }

  if (record.type === "appData") {
    const resolution = parseAppDataResolution(record.resolution);
    if (!resolution) return null;
    return { type: "appData", question, resolution };
  }

  return null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseRequest(body);
  if (!parsed) {
    return NextResponse.json(
      { error: "Expected a policy or appData assistant request." },
      { status: 400 },
    );
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (event: AssistantStreamEvent) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      void generateAssistantAnswer(parsed, (progress) => {
        send({ type: "progress", ...progress });
      })
        .then((answer) => {
          send({ type: "result", answer });
          controller.close();
        })
        .catch((error: unknown) => {
          let message = "The assistant model could not start.";
          if (error instanceof Error) {
            message = error.message;
            if (error.cause instanceof Error && error.cause.message) {
              message = `${message}: ${error.cause.message}`;
            }
          }
          send({ type: "error", message });
          controller.close();
        });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
