import { describe, expect, it } from "vitest";
import {
  canSubmitMobile,
  canSubmitOtp,
  initialLoginState,
  loginReducer,
  otpValue,
  type LoginAction,
  type LoginState,
} from "./loginMachine";

function reduce(state: LoginState, ...actions: LoginAction[]): LoginState {
  return actions.reduce(loginReducer, state);
}

const withMobile = (mobile: string): LoginState =>
  reduce(initialLoginState, { type: "set-mobile", value: mobile });

const atOtpStep = (): LoginState =>
  reduce(withMobile("9876543210"), { type: "submit-mobile" });

const filledOtp = (code = "123456"): LoginState =>
  reduce(atOtpStep(), { type: "fill-otp", index: 0, text: code });

describe("set-mobile", () => {
  it("normalises as it stores", () => {
    expect(withMobile("+91 98765 43210").mobile).toBe("9876543210");
  });

  it("clears a previous error", () => {
    const errored = reduce(filledOtp("111111"), { type: "submit-otp" }, {
      type: "verify-failed",
      message: "Incorrect OTP. Please try again.",
    });

    expect(reduce(errored, { type: "set-mobile", value: "98" }).error).toBeNull();
  });
});

describe("submit-mobile", () => {
  it("is a no-op below ten digits", () => {
    const state = withMobile("987654321");
    expect(loginReducer(state, { type: "submit-mobile" })).toBe(state);
  });

  it("advances to the otp step at ten digits", () => {
    expect(atOtpStep().step).toBe("otp");
  });

  it("clears any digits and error carried over from a previous attempt", () => {
    const errored = reduce(filledOtp("111111"), { type: "submit-otp" }, {
      type: "verify-failed",
      message: "nope",
    });
    const restarted = reduce(errored, { type: "change-number" }, {
      type: "submit-mobile",
    });

    expect(otpValue(restarted)).toBe("");
    expect(restarted.error).toBeNull();
    expect(restarted.status).toBe("idle");
  });
});

describe("change-number", () => {
  it("returns to the phone step keeping the number", () => {
    const state = reduce(filledOtp(), { type: "change-number" });

    expect(state.step).toBe("phone");
    expect(state.mobile).toBe("9876543210");
    expect(otpValue(state)).toBe("");
    expect(state.error).toBeNull();
  });
});

describe("submit-otp", () => {
  it("is a no-op below six digits", () => {
    const state = filledOtp("12345");
    expect(loginReducer(state, { type: "submit-otp" })).toBe(state);
  });

  it("moves to verifying when complete", () => {
    expect(reduce(filledOtp(), { type: "submit-otp" }).status).toBe("verifying");
  });

  it("ignores a second submit while verifying", () => {
    // Otherwise a double-tap starts two verify timers.
    const verifying = reduce(filledOtp(), { type: "submit-otp" });
    expect(loginReducer(verifying, { type: "submit-otp" })).toBe(verifying);
  });
});

describe("verify-failed", () => {
  it("records the error and clears every digit", () => {
    const state = reduce(filledOtp("111111"), { type: "submit-otp" }, {
      type: "verify-failed",
      message: "Incorrect OTP. Please try again.",
    });

    expect(state.status).toBe("error");
    expect(state.error).toBe("Incorrect OTP. Please try again.");
    expect(otpValue(state)).toBe("");
  });

  it("is dismissed as soon as a digit is retyped", () => {
    const errored = reduce(filledOtp("111111"), { type: "submit-otp" }, {
      type: "verify-failed",
      message: "nope",
    });
    const retyped = reduce(errored, {
      type: "set-otp-digit",
      index: 0,
      value: "1",
    });

    expect(retyped.error).toBeNull();
    expect(retyped.status).toBe("idle");
  });
});

describe("verify-succeeded", () => {
  it("locks the verified OTP state while MPIN setup is pending", () => {
    const verified = reduce(filledOtp(), { type: "submit-otp" }, {
      type: "verify-succeeded",
    });

    expect(verified.status).toBe("verified");
    expect(canSubmitOtp(verified)).toBe(false);
    expect(canSubmitMobile(verified)).toBe(false);
  });

  it("is ignored unless an OTP verification is in progress", () => {
    const state = filledOtp();
    expect(loginReducer(state, { type: "verify-succeeded" })).toBe(state);
  });
});

describe("set-otp-digit", () => {
  it("keeps only the last typed digit", () => {
    const state = reduce(atOtpStep(), {
      type: "set-otp-digit",
      index: 0,
      value: "7",
    });
    expect(state.otp[0]).toBe("7");
  });

  it("ignores an out-of-range index", () => {
    const state = atOtpStep();
    expect(loginReducer(state, { type: "set-otp-digit", index: 6, value: "1" })).toBe(
      state,
    );
  });
});

describe("resend", () => {
  it("clears the boxes and bumps the nonce", () => {
    const state = reduce(filledOtp(), { type: "resend" });

    expect(otpValue(state)).toBe("");
    expect(state.error).toBeNull();
    expect(state.resendNonce).toBe(1);
  });
});

describe("submit guards", () => {
  it("canSubmitMobile tracks validity", () => {
    expect(canSubmitMobile(withMobile("987654321"))).toBe(false);
    expect(canSubmitMobile(withMobile("9876543210"))).toBe(true);
  });

  it("canSubmitOtp tracks completeness", () => {
    expect(canSubmitOtp(filledOtp("12345"))).toBe(false);
    expect(canSubmitOtp(filledOtp())).toBe(true);
  });

  it("both are false while verifying", () => {
    const verifying = reduce(filledOtp(), { type: "submit-otp" });
    expect(canSubmitOtp(verifying)).toBe(false);
    expect(canSubmitMobile(verifying)).toBe(false);
  });
});
