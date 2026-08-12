import {
  appendMpinDigit,
  emptyMpin,
  isMpinComplete,
  MPIN_LENGTH,
  MPIN_MISMATCH_MESSAGE,
  mpinValue,
  removeLastMpinDigit,
} from "./mpin";

export type MpinStep = "intro" | "create" | "success";
export type MpinField = "pin" | "confirm";
export type MpinStatus = "idle" | "saving" | "error";

export type MpinSetupState = {
  step: MpinStep;
  /** Always length 4; "" marks an empty box. */
  pin: string[];
  confirm: string[];
  activeField: MpinField;
  status: MpinStatus;
  error: string | null;
};

export type MpinSetupAction =
  | { type: "start" }
  | { type: "press-digit"; value: string }
  | { type: "press-backspace" }
  | { type: "select-field"; field: MpinField }
  | { type: "saving" }
  | { type: "mismatch" }
  | { type: "saved" }
  | { type: "go-back" };

export const initialMpinSetupState: MpinSetupState = {
  step: "intro",
  pin: emptyMpin(),
  confirm: emptyMpin(),
  activeField: "pin",
  status: "idle",
  error: null,
};

/** The box row currently selected on the combined creation screen. */
export function activeDigits(state: MpinSetupState): string[] {
  return state.activeField === "confirm" ? state.confirm : state.pin;
}

/**
 * The reducer guard backs up the disabled CTA so a stale handler cannot save
 * while either row is incomplete.
 */
export function canAdvance(state: MpinSetupState): boolean {
  return (
    isMpinComplete(state.pin) &&
    isMpinComplete(state.confirm) &&
    state.status !== "saving"
  );
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
      return {
        ...state,
        step: "create",
        pin: emptyMpin(),
        confirm: emptyMpin(),
        activeField: "pin",
      };
    }

    case "press-digit": {
      if (state.status === "saving") return state;
      const digits = appendMpinDigit(activeDigits(state), action.value);
      const patch =
        state.activeField === "confirm" ? { confirm: digits } : { pin: digits };
      return {
        ...state,
        ...patch,
        activeField:
          state.activeField === "pin" && isMpinComplete(digits)
            ? "confirm"
            : state.activeField,
        status: "idle",
        error: null,
      };
    }

    case "press-backspace": {
      if (state.status === "saving") return state;
      const digits = removeLastMpinDigit(activeDigits(state));
      const patch =
        state.activeField === "confirm" ? { confirm: digits } : { pin: digits };
      return { ...state, ...patch, status: "idle", error: null };
    }

    case "select-field": {
      if (state.step !== "create" || state.status === "saving") return state;
      return { ...state, activeField: action.field, error: null };
    }

    case "saving": {
      if (state.step !== "create" || !canAdvance(state)) return state;
      return { ...state, status: "saving", error: null };
    }

    case "mismatch": {
      // Clears only the confirm row: the first entry is almost always the one
      // the user meant, so making them retype both punishes the wrong mistake.
      return {
        ...state,
        confirm: emptyMpin(),
        activeField: "confirm",
        status: "error",
        error: MPIN_MISMATCH_MESSAGE,
      };
    }

    case "saved": {
      return { ...state, step: "success", status: "idle", error: null };
    }

    case "go-back": {
      if (state.step === "create") {
        return { ...initialMpinSetupState };
      }
      return state;
    }

    default:
      return state;
  }
}

export { MPIN_LENGTH };
