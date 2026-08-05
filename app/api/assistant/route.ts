import { NextResponse } from "next/server";
import {
  EMPLOYER_BENEFITS_CATALOG,
  type PolicyTabId,
} from "@/features/policy/constants";
import type {
  AssistantGenerateRequest,
  AssistantStreamEvent,
  AssistantTurn,
} from "@/lib/assistant/assistantApiTypes";
import type {
  AppDataResolution,
  ClaimAnswerStatus,
} from "@/lib/assistant/appData";
import { MAX_HISTORY_TURNS } from "@/lib/assistant/history";
import { generateAssistantAnswer } from "@/lib/assistant/serverModel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const POLICY_TAB_IDS = new Set<string>(
  EMPLOYER_BENEFITS_CATALOG.benefits.map((category) => category.id),
);

const CLAIM_STATUSES = new Set<string>([
  "Approved",
  "Pending",
  "Needs info",
  "Rejected",
  "Revoked",
]);

const MAX_QUESTION_CHARS = 1000;
const MAX_TURN_CHARS = 800;
const MAX_CATEGORY_IDS = 3;

function isPolicyTabId(value: unknown): value is PolicyTabId {
  return typeof value === "string" && POLICY_TAB_IDS.has(value);
}

function parseClaimStatus(value: unknown): ClaimAnswerStatus | undefined {
  return typeof value === "string" && CLAIM_STATUSES.has(value)
    ? (value as ClaimAnswerStatus)
    : undefined;
}

function parseHistory(value: unknown): AssistantTurn[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return undefined;

  const turns: AssistantTurn[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    if (record.role !== "user" && record.role !== "assistant") continue;
    if (typeof record.content !== "string" || !record.content.trim()) continue;
    turns.push({
      role: record.role,
      content: record.content.slice(0, MAX_TURN_CHARS),
    });
  }

  return turns.slice(-MAX_HISTORY_TURNS);
}

function parseCategoryIds(value: unknown): PolicyTabId[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const ids: PolicyTabId[] = [];
  for (const entry of value) {
    if (!isPolicyTabId(entry)) return null;
    if (!ids.includes(entry)) ids.push(entry);
  }
  return ids.length > 0 ? ids.slice(0, MAX_CATEGORY_IDS) : null;
}

function parseOptionalCategoryId(
  value: unknown,
): { ok: true; id?: PolicyTabId } | { ok: false } {
  if (value === undefined) return { ok: true };
  if (!isPolicyTabId(value)) return { ok: false };
  return { ok: true, id: value };
}

function parseAppDataResolution(value: unknown): AppDataResolution | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;

  if (record.kind === "wallets") {
    return { kind: "wallets" };
  }

  if (record.kind === "merchants") {
    if (
      record.benefitType !== undefined &&
      record.benefitType !== "meal" &&
      record.benefitType !== "fuel"
    ) {
      return null;
    }
    return {
      kind: "merchants",
      benefitType:
        record.benefitType === "meal" || record.benefitType === "fuel"
          ? record.benefitType
          : undefined,
      query:
        typeof record.query === "string"
          ? record.query.slice(0, 60)
          : undefined,
    };
  }

  if (record.kind === "rules") {
    const category = parseOptionalCategoryId(record.categoryId);
    if (!category.ok) return null;
    return { kind: "rules", categoryId: category.id };
  }

  if (record.kind === "dashboard") {
    const category = parseOptionalCategoryId(record.categoryId);
    if (!category.ok) return null;
    return { kind: "dashboard", categoryId: category.id };
  }

  if (record.kind === "claims") {
    const category = parseOptionalCategoryId(record.categoryId);
    if (!category.ok) return null;
    if (
      record.status !== undefined &&
      parseClaimStatus(record.status) === undefined
    ) {
      return null;
    }
    return {
      kind: "claims",
      categoryId: category.id,
      claimId: typeof record.claimId === "string" ? record.claimId : undefined,
      status: parseClaimStatus(record.status),
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

  const question = record.question.trim().slice(0, MAX_QUESTION_CHARS);
  const history = parseHistory(record.history);

  if (record.type === "route") {
    return { type: "route", question, history };
  }

  if (record.type === "policy") {
    const categoryIds = parseCategoryIds(record.categoryIds);
    if (!categoryIds) return null;
    return { type: "policy", question, categoryIds, history };
  }

  if (record.type === "appData") {
    const resolution = parseAppDataResolution(record.resolution);
    if (!resolution) return null;
    return { type: "appData", question, resolution, history };
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
      { error: "Expected a policy, appData, or route assistant request." },
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
