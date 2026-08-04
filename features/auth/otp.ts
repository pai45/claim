export const OTP_LENGTH = 6;

/**
 * Demo build: there is no SMS gateway, so one code is accepted and everything
 * else exercises the error path.
 */
export const DEMO_OTP = "123456";

export const OTP_ERROR_MESSAGE = "Incorrect OTP. Please try again.";

export type OtpResult = { ok: true } | { ok: false; message: string };

export function verifyOtp(value: string): OtpResult {
  if (value === DEMO_OTP) return { ok: true };
  return { ok: false, message: OTP_ERROR_MESSAGE };
}

/**
 * Spreads pasted or autofilled text across the boxes starting at `index`.
 *
 * iOS hands the whole SMS code to the first input rather than firing six
 * separate events, so paste and autofill share this one path.
 */
export function distributeOtpPaste(
  digits: string[],
  index: number,
  text: string,
): string[] {
  const incoming = text.replace(/\D/g, "");
  if (!incoming) return digits;

  const next = [...digits];
  for (let offset = 0; offset < incoming.length; offset += 1) {
    const target = index + offset;
    if (target >= OTP_LENGTH) break;
    next[target] = incoming[offset];
  }

  return next;
}

export function isOtpComplete(digits: string[]): boolean {
  return digits.length === OTP_LENGTH && digits.every((digit) => digit !== "");
}
