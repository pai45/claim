import { describe, expect, it } from "vitest";
import { getBenefitsStatePersonaId } from "./benefitsState";

describe("benefits state persona", () => {
  it("gives Rohan Aarav's fresh EB+ state only after activation", () => {
    expect(getBenefitsStatePersonaId("pluspay_only", false)).toBe("returning");
    expect(getBenefitsStatePersonaId("pluspay_only", true)).toBe("new_user");
  });

  it("keeps Aarav fresh and every other persona on returning state", () => {
    expect(getBenefitsStatePersonaId("new_user", false)).toBe("new_user");
    expect(getBenefitsStatePersonaId("returning", false)).toBe("returning");
  });
});
