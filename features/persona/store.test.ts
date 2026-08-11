import { beforeEach, describe, expect, it } from "vitest";
import {
  getActivePersonaConfig,
  getActivePersonaId,
  setActivePersonaId,
} from "./store";
import { PERSONA_STORAGE_KEY } from "./constants";
import { PERSONA_OPTIONS } from "./constants";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
}

describe("persona store", () => {
  let local: ReturnType<typeof memoryStorage>;

  beforeEach(() => {
    local = memoryStorage();
  });

  it("defaults to returning user when storage is empty", () => {
    expect(getActivePersonaId(local)).toBe("returning");
    expect(getActivePersonaConfig(local).id).toBe("returning");
    expect(getActivePersonaConfig(local).profile.name).toBe("Vishal Sharma");
  });

  it("sets and persists new_user persona", () => {
    setActivePersonaId("new_user", local);
    expect(local.getItem(PERSONA_STORAGE_KEY)).toBe("new_user");
    expect(getActivePersonaId(local)).toBe("new_user");
    expect(getActivePersonaConfig(local).id).toBe("new_user");
    expect(getActivePersonaConfig(local).profile.name).toBe("Aarav Patel");
    expect(getActivePersonaConfig(local).access.products).toEqual({
      ebPlus: true,
      plusPay: false,
    });
    expect(getActivePersonaConfig(local).hasClaims).toBe(false);
    expect(getActivePersonaConfig(local).hasTransactions).toBe(false);
  });

  it("keeps Rahul on Vishal's account state with fresh onboarding", () => {
    setActivePersonaId("rahul_onboarding", local);

    const rahul = getActivePersonaConfig(local);
    const vishal = PERSONA_OPTIONS.find((persona) => persona.id === "returning");

    expect(local.getItem(PERSONA_STORAGE_KEY)).toBe("rahul_onboarding");
    expect(rahul.profile).toMatchObject({
      name: "Rahul Verma",
      initials: "R",
      email: "rahul.verma@infosys.com",
      employeeId: "EMP-20493",
    });
    expect(rahul.access).toEqual(vishal?.access);
    expect(rahul.hasClaims).toBe(true);
    expect(rahul.hasTransactions).toBe(true);
    expect(rahul.hasCompletedOnboarding).toBe(false);
    expect(rahul.isCardActivated).toBe(true);
    expect(rahul.hasUpiId).toBe(true);
  });

  it("handles corrupted/invalid persona key by falling back to returning", () => {
    local.setItem(PERSONA_STORAGE_KEY, "invalid_id_123");
    expect(getActivePersonaId(local)).toBe("returning");
  });

  it("persists every supported persona and resolves its access plan", () => {
    for (const persona of PERSONA_OPTIONS) {
      setActivePersonaId(persona.id, local);
      expect(getActivePersonaId(local)).toBe(persona.id);
      expect(getActivePersonaConfig(local).access).toEqual(persona.access);
    }
  });

  it("maps the three restricted personas to the expected products", () => {
    setActivePersonaId("ebPlus_only", local);
    expect(getActivePersonaConfig(local).access.products).toEqual({
      ebPlus: true,
      plusPay: false,
    });

    setActivePersonaId("pluspay_only", local);
    expect(getActivePersonaConfig(local).access.defaultProduct).toBe("pluspay");

    setActivePersonaId("ebPlus_no_upi", local);
    expect(getActivePersonaConfig(local).access.upiEnabled).toBe(false);
  });
});
