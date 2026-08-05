import {
  appendMpinDigit,
  emptyMpin,
  isMpinComplete,
  MPIN_LENGTH,
  MPIN_MISMATCH_MESSAGE,
  mpinValue,
  removeLastMpinDigit,
} from "./mpin";

export type MpinStep = "intro" | "set" | "confirm" | "success";
export type MpinStatus = "idle" | "saving" | "error";

export type MpinSetupState = {
  step: MpinStep;
  /** Always length 4; "" marks an empty box. */
  pin: string[];
  confirm: string[];
  status: MpinStatus;
  error: string | null;
};

export type MpinSetupAction =
  | { type: "start" }
  | { type: "press-digit"; value: string }
  | { type: "press-backspace" }
  | { type: "advance" }
  | { type: "saving" }
  | { type: "mismatch" }
  | { type: "saved" }
  | { type: "go-back" };

export const initialMpinSetupState: MpinSetupState = {
  step: "intro",
  pin: emptyMpin(),
  confirm: emptyMpin(),
  status: "idle",
  error: null,
};

/** The box row the current step is editing. */
export function activeDigits(state: MpinSetupState): string[] {
  return state.step === "confirm" ? state.confirm : state.pin;
}

/**
 * Guards live here rather than on the disabled attribute alone, so the
 * auto-advance timer cannot fire against a half-filled row.
 */
export function canAdvance(state: MpinSetupState): boolean {
  return isMpinComplete(activeDigits(state)) && state.status !== "saving";
}

export function mpinMatches(state: MpinSetupState): boolean {
  return mpinValue(state.pin) === mpinValue(state.confirm);
}

export function mpinSetupReducer(
  state: MpinSetupState,
  action: MpinSetupAction,
): MpinSetupState {
  switch (action.type) {
    case "start": {
      return { ...state, step: "set", pin: emptyMpin(), confirm: emptyMpin() };
    }

    case "press-digit": {
      if (state.status === "saving") return state;
      const digits = appendMpinDigit(activeDigits(state), action.value);
      const patch =
        state.step === "confirm" ? { confirm: digits } : { pin: digits };
      return { ...state, ...patch, status: "idle", error: null };
    }

    case "press-backspace": {
      if (state.status === "saving") return state;
      const digits = removeLastMpinDigit(activeDigits(state));
      const patch =
        state.step === "confirm" ? { confirm: digits } : { pin: digits };
      return { ...state, ...patch, status: "idle", error: null };
    }

    case "advance": {
      if (state.step !== "set" || !canAdvance(state)) return state;
      return {
        ...state,
        step: "confirm",
        confirm: emptyMpin(),
        status: "idle",
        error: null,
      };
    }

    case "saving": {
      if (state.step !== "confirm" || !canAdvance(state)) return state;
      return { ...state, status: "saving", error: null };
    }

    case "mismatch": {
      // Clears only the confirm row: the first entry is almost always the one
      // the user meant, so making them retype both punishes the wrong mistake.
      return {
        ...state,
        confirm: emptyMpin(),
        status: "error",
        error: MPIN_MISMATCH_MESSAGE,
      };
    }

    case "saved": {
      return { ...state, step: "success", status: "idle", error: null };
    }

    case "go-back": {
      if (state.step === "confirm") {
        // Both rows clear: returning to "Set" means choosing a new PIN, so a
        // stale first entry would silently become the thing to match.
        return {
          ...state,
          step: "set",
          pin: emptyMpin(),
          confirm: emptyMpin(),
          status: "idle",
          error: null,
        };
      }
      if (state.step === "set") {
        return { ...initialMpinSetupState };
      }
      return state;
    }

    default:
      return state;
  }
}

export { MPIN_LENGTH };
