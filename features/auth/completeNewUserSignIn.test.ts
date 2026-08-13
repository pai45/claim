import { describe, expect, it } from "vitest";
import { isMpinUnlocked } from "./mpinStorage";
import { loadAuthSession } from "./session";
import { completeNewUserSignIn } from "./completeNewUserSignIn";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
}

describe("new-user sign-in handoff", () => {
  it("starts the session unlocked after MPIN creation", () => {
    const local = memoryStorage();
    const session = memoryStorage();

    completeNewUserSignIn("9876543210", local, session, 1000);

    expect(isMpinUnlocked(session)).toBe(true);
    expect(loadAuthSession(local)).toEqual({
      mobile: "9876543210",
      countryCode: "+91",
      signedInAt: 1000,
    });
  });
});
