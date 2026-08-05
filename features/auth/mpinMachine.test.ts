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
  it("walks intro → set → confirm → success", () => {
    let state = initialMpinSetupState;
    expect(state.step).toBe("intro");

    state = mpinSetupReducer(state, { type: "start" });
    expect(state.step).toBe("set");

    state = type(state, "1357");
    expect(canAdvance(state)).toBe(true);

    state = mpinSetupReducer(state, { type: "advance" });
    expect(state.step).toBe("confirm");
    // The confirm row starts empty even though the set row is full.
    expect(mpinValue(state.confirm)).toBe("");

    state = type(state, "1357");
    expect(mpinMatches(state)).toBe(true);

    state = mpinSetupReducer(state, { type: "saving" });
    state = mpinSetupReducer(state, { type: "saved" });
    expect(state.step).toBe("success");
  });

  it("routes presses to whichever row the step is editing", () => {
    let state = mpinSetupReducer(initialMpinSetupState, { type: "start" });
    state = type(state, "1111");
    state = mpinSetupReducer(state, { type: "advance" });
    state = type(state, "22");

    expect(mpinValue(state.pin)).toBe("1111");
    expect(mpinValue(state.confirm)).toBe("22");
    expect(mpinValue(activeDigits(state))).toBe("22");
  });

  it("stops at four digits and no-ops on backspace when empty", () => {
    let state = mpinSetupReducer(initialMpinSetupState, { type: "start" });
    state = type(state, "123456");
    expect(mpinValue(state.pin)).toBe("1234");

    state = mpinSetupReducer(initialMpinSetupState, { type: "start" });
    state = mpinSetupReducer(state, { type: "press-backspace" });
    expect(mpinValue(state.pin)).toBe("");
  });

  it("keeps the first entry when the confirmation misses", () => {
    let state = mpinSetupReducer(initialMpinSetupState, { type: "start" });
    state = type(state, "1234");
    state = mpinSetupReducer(state, { type: "advance" });
    state = type(state, "9999");
    expect(mpinMatches(state)).toBe(false);

    state = mpinSetupReducer(state, { type: "mismatch" });
    // Only the confirmation clears: the first entry is almost always the one
    // the user meant, so retyping both would punish the wrong mistake.
    expect(mpinValue(state.pin)).toBe("1234");
    expect(mpinValue(state.confirm)).toBe("");
    expect(state.status).toBe("error");
    expect(state.error).not.toBeNull();
  });

  it("clears both rows when going back from confirm", () => {
    let state = mpinSetupReducer(initialMpinSetupState, { type: "start" });
    state = type(state, "1234");
    state = mpinSetupReducer(state, { type: "advance" });
    state = type(state, "12");

    state = mpinSetupReducer(state, { type: "go-back" });
    expect(state.step).toBe("set");
    // A stale first entry would silently become the thing to match against.
    expect(mpinValue(state.pin)).toBe("");
    expect(mpinValue(state.confirm)).toBe("");
  });

  it("returns to the intro when going back from set", () => {
    let state = mpinSetupReducer(initialMpinSetupState, { type: "start" });
    state = mpinSetupReducer(state, { type: "go-back" });
    expect(state.step).toBe("intro");
  });

  it("refuses to advance or save on a half-filled row", () => {
    let state = mpinSetupReducer(initialMpinSetupState, { type: "start" });
    state = type(state, "12");

    expect(canAdvance(state)).toBe(false);
    expect(mpinSetupReducer(state, { type: "advance" }).step).toBe("set");
  });

  it("ignores presses while the pin is being saved", () => {
    let state = mpinSetupReducer(initialMpinSetupState, { type: "start" });
    state = type(state, "1234");
    state = mpinSetupReducer(state, { type: "advance" });
    state = type(state, "1234");
    state = mpinSetupReducer(state, { type: "saving" });

    expect(mpinSetupReducer(state, { type: "press-backspace" })).toBe(state);
  });
});
