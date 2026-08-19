import { describe, expect, it } from "vitest";
import {
  createRoutePrompt,
  extractJsonObject,
  parseAssistantRoute,
  routePlanFor,
} from "./route";

const FULL_ROUTE = {
  intent: "policy",
  categoryIds: ["fuel"],
  claimId: null,
  status: null,
  benefitType: null,
  merchantQuery: null,
};

describe("route JSON extraction", () => {
  it("pulls the object out of a chatty reply", () => {
    const raw = `Sure! Here you go:\n\`\`\`json\n${JSON.stringify(FULL_ROUTE)}\n\`\`\`\nHope that helps.`;
    expect(extractJsonObject(raw)).toBe(JSON.stringify(FULL_ROUTE));
  });

  it("handles braces inside strings", () => {
    const raw = '{"intent":"policy","merchantQuery":"a } b"}';
    expect(extractJsonObject(`noise ${raw} trailing`)).toBe(raw);
  });

  it("returns null when there is no object", () => {
    expect(extractJsonObject("I think you want the fuel policy.")).toBeNull();
  });
});

describe("route validation", () => {
  it("accepts a well-formed route", () => {
    expect(parseAssistantRoute(JSON.stringify(FULL_ROUTE))).toEqual({
      intent: "policy",
      categoryIds: ["fuel"],
      claimId: undefined,
      status: undefined,
      benefitType: undefined,
      merchantQuery: undefined,
    });
  });

  it("rejects an intent outside the whitelist", () => {
    expect(
      parseAssistantRoute('{"intent":"transfer_money","categoryIds":[]}'),
    ).toBeNull();
  });

  it("drops category ids that are not in the catalog", () => {
    const route = parseAssistantRoute(
      '{"intent":"policy","categoryIds":["fuel","crypto","meal"]}',
    );
    expect(route?.categoryIds).toEqual(["fuel", "meal"]);
  });

  it("drops a fabricated claim id that is not shaped like one", () => {
    expect(
      parseAssistantRoute('{"intent":"claims","claimId":"the fuel one"}')
        ?.claimId,
    ).toBeUndefined();
    expect(
      parseAssistantRoute('{"intent":"claims","claimId":"clm-44088"}')?.claimId,
    ).toBe("CLM-44088");
  });

  it("drops an unknown status and benefit type", () => {
    const route = parseAssistantRoute(
      '{"intent":"claims","status":"Escalated","benefitType":"petrol"}',
    );
    expect(route?.status).toBeUndefined();
    expect(route?.benefitType).toBeUndefined();
  });

  it("returns null for output that is not JSON at all", () => {
    expect(parseAssistantRoute("I can help with that!")).toBeNull();
  });
});

describe("route planning", () => {
  it("maps a policy route with categories onto the policy path", () => {
    const plan = routePlanFor({ intent: "policy", categoryIds: ["meal", "fuel"] });
    expect(plan?.kind).toBe("policy");
    if (plan?.kind === "policy") {
      expect(plan.categories.map((category) => category.id)).toEqual([
        "meal",
        "fuel",
      ]);
    }
  });

  it("falls back to the benefit picker when no category was identified", () => {
    expect(routePlanFor({ intent: "policy", categoryIds: [] })).toEqual({
      kind: "intent",
      intentId: "view_policy",
    });
  });

  it("maps catalog-wide and rules questions onto app-data sources", () => {
    expect(routePlanFor({ intent: "wallets", categoryIds: [] })).toEqual({
      kind: "appData",
      resolution: { kind: "wallets" },
    });
    expect(routePlanFor({ intent: "rules", categoryIds: ["books"] })).toEqual({
      kind: "appData",
      resolution: { kind: "rules", categoryId: "books" },
    });
  });

  it("keeps guided flows on their deterministic intents", () => {
    expect(routePlanFor({ intent: "upload", categoryIds: [] })).toEqual({
      kind: "intent",
      intentId: "upload_claim",
    });
    expect(routePlanFor({ intent: "vehicle", categoryIds: [] })).toEqual({
      kind: "intent",
      intentId: "vehicle_registration",
    });
    expect(routePlanFor({ intent: "driver", categoryIds: [] })).toEqual({
      kind: "intent",
      intentId: "driver_registration",
    });
  });

  it("declines to answer out-of-scope questions", () => {
    expect(routePlanFor({ intent: "unknown", categoryIds: [] })).toBeNull();
  });
});

describe("route prompt", () => {
  it("lists every catalog category so the model can only pick real ids", () => {
    const [system] = createRoutePrompt("What is my fuel limit?");
    expect(system.content).toContain('"professional"');
    expect(system.content).toContain('"mobile"');
  });

  it("places prior turns between the instructions and the question", () => {
    const prompt = createRoutePrompt("And last month?", [
      { role: "user", content: "Show my fuel claims" },
      { role: "assistant", content: "Here are your fuel claims." },
    ]);

    expect(prompt.map((turn) => turn.role)).toEqual([
      "system",
      "user",
      "assistant",
      "user",
    ]);
    expect(prompt.at(-1)?.content).toContain("And last month?");
  });
});
