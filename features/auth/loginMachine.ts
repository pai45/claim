import { formatMobileInput, isValidMobile } from "./phoneNumber";
import { distributeOtpPaste, isOtpComplete, OTP_LENGTH } from "./otp";

export type LoginStep = "phone" | "otp";
export type LoginStatus = "idle" | "verifying" | "verified" | "error";

export type LoginState = {
  step: LoginStep;
  /** National digits only, at most 10. */
  mobile: string;
  /** Always length 6; "" marks an empty box. */
  otp: string[];
  status: LoginStatus;
  error: string | null;
  /** Increments on resend; the screen keys its cooldown timer off it. */
  resendNonce: number;
};

export type LoginAction =
  | { type: "set-mobile"; value: string }
  | { type: "submit-mobile" }
  | { type: "change-number" }
  | { type: "set-otp-digit"; index: number; value: string }
  | { type: "fill-otp"; index: number; text: string }
  | { type: "submit-otp" }
  | { type: "verify-succeeded" }
  | { type: "verify-failed"; message: string }
  | { type: "resend" };

const emptyOtp = (): string[] => Array.from({ length: OTP_LENGTH }, () => "");

export const initialLoginState: LoginState = {
  step: "phone",
  mobile: "",
  otp: emptyOtp(),
  status: "idle",
  error: null,
  resendNonce: 0,
};

export function otpValue(state: LoginState): string {
  return state.otp.join("");
}

/**
 * Guards live here rather than on the disabled attribute alone, so an Enter
 * keypress cannot bypass what the greyed-out CTA implies.
 */
export function canSubmitMobile(state: LoginState): boolean {
  return (
    isValidMobile(state.mobile) &&
    state.status !== "verifying" &&
    state.status !== "verified"
  );
}

export function canSubmitOtp(state: LoginState): boolean {
  return (
    isOtpComplete(state.otp) &&
    state.status !== "verifying" &&
    state.status !== "verified"
  );
}

export function loginReducer(
  state: LoginState,
  action: LoginAction,
): LoginState {
  switch (action.type) {
    case "set-mobile": {
      return {
        ...state,
        mobile: formatMobileInput(action.value),
        status: state.status === "verifying" ? state.status : "idle",
        error: null,
      };
    }

    case "submit-mobile": {
      if (!canSubmitMobile(state)) return state;
      return {
        ...state,
        step: "otp",
        otp: emptyOtp(),
        status: "idle",
        error: null,
      };
    }

    case "change-number": {
      // Keeps `mobile` — "Change" edits the existing number, it does not reset.
      return {
        ...state,
        step: "phone",
        otp: emptyOtp(),
        status: "idle",
        error: null,
      };
    }

    case "set-otp-digit": {
      const digit = action.value.replace(/\D/g, "").slice(-1);
      const otp = [...state.otp];
      if (action.index < 0 || action.index >= OTP_LENGTH) return state;
      otp[action.index] = digit;
      return { ...state, otp, status: "idle", error: null };
    }

    case "fill-otp": {
      return {
        ...state,
        otp: distributeOtpPaste(state.otp, action.index, action.text),
        status: "idle",
        error: null,
      };
    }

    case "submit-otp": {
      if (!canSubmitOtp(state)) return state;
      return { ...state, status: "verifying", error: null };
    }

    case "verify-failed": {
      // Clearing beats preserving: it matches Indian banking apps and gives
      // focus an unambiguous destination.
      return {
        ...state,
        otp: emptyOtp(),
        status: "error",
        error: action.message,
      };
    }

    case "verify-succeeded": {
      if (state.status !== "verifying") return state;
      return { ...state, status: "verified", error: null };
    }

    case "resend": {
      return {
        ...state,
        otp: emptyOtp(),
        status: "idle",
        error: null,
        resendNonce: state.resendNonce + 1,
      };
    }

    default:
      return state;
  }
}
