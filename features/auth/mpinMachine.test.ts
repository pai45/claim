import { describe, expect, it } from "vitest";
import { mpinValue } from "./mpin";
import {
  activeDigits,
  canAdvance,
  initialMpinSetupState,
  mpinMatches,
  mpinSetupReducer,
  type MpinSetupState,
} from "./mpinMachine";

function type(state: MpinSetupState, digits: string): MpinSetupState {
  return digits
    .split("")
    .reduce(
      (current, value) =>
        mpinSetupReducer(current, { type: "press-digit", value }),
      state,
    );
}

describe("mpinSetupReducer", () => {
  it("walks intro to create to success", () => {
    let state = initialMpinSetupState;
    expect(state.step).toBe("intro");

    state = mpinSetupReducer(state, { type: "start" });
    expect(state.step).toBe("create");

    state = type(state, "1357");
    expect(state.activeField).toBe("confirm");
    expect(canAdvance(state)).toBe(false);
    expect(mpinValue(state.confirm)).toBe("");

    state = type(state, "1357");
    expect(mpinMatches(state)).toBe(true);
    expect(canAdvance(state)).toBe(true);

    state = mpinSetupReducer(state, { type: "saving" });
    state = mpinSetupReducer(state, { type: "saved" });
    expect(state.step).toBe("success");
  });

  it("moves to confirmation and supports selecting either row", () => {
    let state = mpinSetupReducer(initialMpinSetupState, { type: "start" });
    state = type(state, "1111");
    state = type(state, "22");

    expect(mpinValue(state.pin)).toBe("1111");
    expect(mpinValue(state.confirm)).toBe("22");
    expect(mpinValue(activeDigits(state))).toBe("22");

    state = mpinSetupReducer(state, { type: "select-field", field: "pin" });
    state = mpinSetupReducer(state, { type: "press-backspace" });
    expect(mpinValue(state.pin)).toBe("111");
  });

  it("stops at four digits and no-ops on backspace when empty", () => {
    let state = mpinSetupReducer(initialMpinSetupState, { type: "start" });
    state = type(state, "123456");
    expect(mpinValue(state.pin)).toBe("1234");
    expect(mpinValue(state.confirm)).toBe("56");

    state = mpinSetupReducer(initialMpinSetupState, { type: "start" });
    state = mpinSetupReducer(state, { type: "press-backspace" });
    expect(mpinValue(state.pin)).toBe("");
  });

  it("keeps the first entry when the confirmation misses", () => {
    let state = mpinSetupReducer(initialMpinSetupState, { type: "start" });
    state = type(state, "12349999");
    expect(mpinMatches(state)).toBe(false);

    state = mpinSetupReducer(state, { type: "mismatch" });
    expect(mpinValue(state.pin)).toBe("1234");
    expect(mpinValue(state.confirm)).toBe("");
    expect(state.activeField).toBe("confirm");
    expect(state.status).toBe("error");
    expect(state.error).not.toBeNull();
  });

  it("returns to intro and clears both rows when going back", () => {
    let state = mpinSetupReducer(initialMpinSetupState, { type: "start" });
    state = type(state, "123412");

    state = mpinSetupReducer(state, { type: "go-back" });
    expect(state.step).toBe("intro");
    expect(mpinValue(state.pin)).toBe("");
    expect(mpinValue(state.confirm)).toBe("");
  });

  it("refuses to save until both rows are filled", () => {
    let state = mpinSetupReducer(initialMpinSetupState, { type: "start" });
    state = type(state, "12");

    expect(canAdvance(state)).toBe(false);
    expect(mpinSetupReducer(state, { type: "saving" }).status).toBe("idle");
  });

  it("ignores presses while the pin is being saved", () => {
    let state = mpinSetupReducer(initialMpinSetupState, { type: "start" });
    state = type(state, "12341234");
    state = mpinSetupReducer(state, { type: "saving" });

    expect(mpinSetupReducer(state, { type: "press-backspace" })).toBe(state);
  });
});
