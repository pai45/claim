import { beforeEach, describe, expect, it } from "vitest";
import {
  getActivePersonaConfig,
  getActivePersonaId,
  setActivePersonaId,
} from "./store";
import { PERSONA_STORAGE_KEY } from "./constants";

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
    expect(getActivePersonaConfig(local).hasClaims).toBe(false);
    expect(getActivePersonaConfig(local).hasTransactions).toBe(false);
  });

  it("handles corrupted/invalid persona key by falling back to returning", () => {
    local.setItem(PERSONA_STORAGE_KEY, "invalid_id_123");
    expect(getActivePersonaId(local)).toBe("returning");
  });
});
