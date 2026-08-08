import {
  EMPLOYER_BENEFITS_CATALOG,
  getPolicyCategory,
  isPolicyTabId,
  type PolicyCategory,
  type PolicyTabId,
} from "@/features/policy/constants";
import type { BenefitType } from "@/lib/merchants/types";
import type { AppDataResolution, ClaimAnswerStatus } from "./appData";
import type { AssistantTurn } from "./assistantApiTypes";
import {
  DRIVER_REGISTRATION_INTENT,
  VEHICLE_REGISTRATION_INTENT,
} from "@/features/chat/constants";

/**
 * Tier 1 routing: the model classifies the question, the app still owns
 * retrieval. Nothing here reaches the user — the route only selects which
 * grounded source gets built, so a bad classification degrades to a wrong-topic
 * answer, never to an invented fact.
 */

export const ROUTE_INTENTS = [
  "policy",
  "dashboard",
  "claims",
  "wallets",
  "rules",
  "merchants",
  "upload",
  "track",
  "merchant_locator",
  "vehicle",
  "driver",
  "greeting",
  "unknown",
] as const;

export type AssistantRouteIntent = (typeof ROUTE_INTENTS)[number];

export type AssistantRoute = {
  intent: AssistantRouteIntent;
  categoryIds: PolicyTabId[];
  claimId?: string;
  status?: ClaimAnswerStatus;
  benefitType?: BenefitType;
  merchantQuery?: string;
};

export type RoutePlan =
  | { kind: "policy"; categories: PolicyCategory[] }
  | { kind: "appData"; resolution: AppDataResolution }
  | { kind: "intent"; intentId: string };

const CLAIM_STATUSES: ClaimAnswerStatus[] = [
  "Approved",
  "Pending",
  "Needs info",
  "Rejected",
  "Revoked",
];

const MAX_CATEGORIES = 3;

function categoryCatalogue(): string {
  return EMPLOYER_BENEFITS_CATALOG.benefits
    .map(
      (benefit) =>
        `  "${benefit.id}" = ${benefit.tabLabel} (${benefit.aliases.slice(0, 4).join(", ")})`,
    )
    .join("\n");
}

export function createRoutePrompt(
  question: string,
  history: AssistantTurn[] = [],
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  return [
    {
      role: "system",
      content: `You classify employee benefit-claim questions. Reply with ONE JSON object and nothing else. No prose, no markdown, no code fences.

Schema:
{"intent": string, "categoryIds": string[], "claimId": string|null, "status": string|null, "benefitType": string|null, "merchantQuery": string|null}

intent must be exactly one of:
  "policy"    - what a benefit covers, its limit, proof, deadline, tax treatment, or how to claim it
  "dashboard" - this employee's balance, utilization, or limit for one benefit or overall
  "claims"    - this employee's submitted claims, their status, amounts, or a specific claim ID
  "wallets"   - comparing or ranking several benefits, or asking where budget is left overall
  "rules"     - what makes a claim pass or fail, required fields, duplicate or deadline checks
  "merchants" - whether a named shop, restaurant, or petrol pump is allowed
  "upload"    - wants to upload, scan, submit, or claim a bill or receipt
  "track"     - wants to track a claim without naming one
  "merchant_locator" - wants to find or search for nearby merchants
  "vehicle"   - wants to register or add a vehicle / car for fuel benefit
  "driver"    - wants to register or add a driver / chauffeur for salary claim
  "greeting"  - hello, help, what can you do
  "unknown"   - anything else, or not about benefits at all

categoryIds may list zero or more of:
${categoryCatalogue()}

status must be null or one of "Approved", "Pending", "Needs info", "Rejected", "Revoked".
benefitType must be null or "meal" or "fuel".
claimId must be null or look like "CLM-44088".
merchantQuery is the shop name if one is mentioned, else null.

Examples:
Q: What proof do I need for fuel? -> {"intent":"policy","categoryIds":["fuel"],"claimId":null,"status":null,"benefitType":null,"merchantQuery":null}
Q: How much my meal wallet balance remains? -> {"intent":"dashboard","categoryIds":["meal"],"claimId":null,"status":null,"benefitType":null,"merchantQuery":null}
Q: What is my available balance? -> {"intent":"dashboard","categoryIds":[],"claimId":null,"status":null,"benefitType":null,"merchantQuery":null}
Q: Which wallet has the most left? -> {"intent":"wallets","categoryIds":[],"claimId":null,"status":null,"benefitType":null,"merchantQuery":null}
Q: What is my total available balance? -> {"intent":"wallets","categoryIds":[],"claimId":null,"status":null,"benefitType":null,"merchantQuery":null}
Q: Why was my claim rejected? -> {"intent":"claims","categoryIds":[],"claimId":null,"status":"Rejected","benefitType":null,"merchantQuery":null}
Q: Is Shell allowed? -> {"intent":"merchants","categoryIds":["fuel"],"claimId":null,"status":null,"benefitType":"fuel","merchantQuery":"Shell"}
Q: Is Swiggy allowed for meals? -> {"intent":"merchants","categoryIds":["meal"],"claimId":null,"status":null,"benefitType":"meal","merchantQuery":"Swiggy"}
Q: Compare the meal and fuel benefits -> {"intent":"policy","categoryIds":["meal","fuel"],"claimId":null,"status":null,"benefitType":null,"merchantQuery":null}
Q: I want to upload a bill -> {"intent":"upload","categoryIds":[],"claimId":null,"status":null,"benefitType":null,"merchantQuery":null}
Q: Register my car -> {"intent":"vehicle","categoryIds":["fuel"],"claimId":null,"status":null,"benefitType":null,"merchantQuery":null}
Q: I want to register my driver -> {"intent":"driver","categoryIds":["driver"],"claimId":null,"status":null,"benefitType":null,"merchantQuery":null}`,
    },
    ...history,
    { role: "user", content: `Q: ${question}` },
  ];
}

/** Pulls the first balanced JSON object out of a chatty model reply. */
export function extractJsonObject(raw: string): string | null {
  const start = raw.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < raw.length; index += 1) {
    const char = raw[index];

    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }

    if (char === '"') inString = true;
    else if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return raw.slice(start, index + 1);
    }
  }

  return null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readCategoryIds(value: unknown): PolicyTabId[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<PolicyTabId>();
  for (const entry of value) {
    if (typeof entry !== "string") continue;
    const candidate = entry.trim().toLowerCase();
    if (isPolicyTabId(candidate) && !seen.has(candidate)) {
      seen.add(candidate);
    }
    if (seen.size >= MAX_CATEGORIES) break;
  }
  return [...seen];
}

function readStatus(value: unknown): ClaimAnswerStatus | undefined {
  const text = readString(value)?.toLowerCase();
  return CLAIM_STATUSES.find((status) => status.toLowerCase() === text);
}

function readBenefitType(value: unknown): BenefitType | undefined {
  const text = readString(value)?.toLowerCase();
  return text === "meal" || text === "fuel" ? text : undefined;
}

function readClaimId(value: unknown): string | undefined {
  const text = readString(value)?.toUpperCase().replace(/\s+/g, "");
  return text && /^CLM-\d{5}$/.test(text) ? text : undefined;
}

/**
 * Strict validation: anything the model invents outside these whitelists is
 * dropped rather than trusted.
 */
export function parseAssistantRoute(raw: string): AssistantRoute | null {
  const json = extractJsonObject(raw);
  if (!json) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }

  const record = parsed as Record<string, unknown>;
  const intentText = readString(record.intent)?.toLowerCase();
  const intent = ROUTE_INTENTS.find((candidate) => candidate === intentText);
  if (!intent) return null;

  const merchantQuery = readString(record.merchantQuery);

  return {
    intent,
    categoryIds: readCategoryIds(record.categoryIds),
    claimId: readClaimId(record.claimId),
    status: readStatus(record.status),
    benefitType: readBenefitType(record.benefitType),
    merchantQuery:
      merchantQuery && merchantQuery.length <= 60 ? merchantQuery : undefined,
  };
}

/** Maps a validated route onto the app's existing retrieval paths. */
export function routePlanFor(route: AssistantRoute): RoutePlan | null {
  const categories = route.categoryIds.map((id) => getPolicyCategory(id));

  switch (route.intent) {
    case "policy":
      return categories.length > 0
        ? { kind: "policy", categories }
        : { kind: "intent", intentId: "view_policy" };

    case "dashboard":
      return {
        kind: "appData",
        resolution: { kind: "dashboard", categoryId: route.categoryIds[0] },
      };

    case "claims":
      return {
        kind: "appData",
        resolution: {
          kind: "claims",
          categoryId: route.categoryIds[0],
          claimId: route.claimId,
          status: route.status,
        },
      };

    case "wallets":
      return { kind: "appData", resolution: { kind: "wallets" } };

    case "rules":
      return {
        kind: "appData",
        resolution: { kind: "rules", categoryId: route.categoryIds[0] },
      };

    case "merchants":
      return {
        kind: "appData",
        resolution: {
          kind: "merchants",
          benefitType: route.benefitType,
          query: route.merchantQuery,
        },
      };

    case "upload":
      return { kind: "intent", intentId: "upload_bill" };
    case "track":
      return { kind: "intent", intentId: "track_claim" };
    case "merchant_locator":
      return { kind: "intent", intentId: "merchant_locator" };
    case "vehicle":
      return { kind: "intent", intentId: VEHICLE_REGISTRATION_INTENT };
    case "driver":
      return { kind: "intent", intentId: DRIVER_REGISTRATION_INTENT };
    case "greeting":
      return { kind: "intent", intentId: "greeting" };
    case "unknown":
      return null;
  }
}
