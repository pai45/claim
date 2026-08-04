/** Indian mobile numbers are 10 digits and never start below 6. */
const MOBILE_PATTERN = /^[6-9]\d{9}$/;

export const MOBILE_LENGTH = 10;
export const COUNTRY_CODE = "+91";

/**
 * Normalises anything a user can type or paste into bare national digits.
 *
 * Pasting from a contact card or an SMS routinely yields "+91 98765 43210" or
 * "09876543210", so the country code and the trunk prefix are stripped before
 * the 10-digit cap is applied — otherwise "+919876543210" would truncate to
 * "9198765432" and silently become a different number.
 */
export function formatMobileInput(raw: string): string {
  let digits = raw.replace(/\D/g, "");

  if (digits.startsWith("91") && digits.length > MOBILE_LENGTH) {
    digits = digits.slice(2);
  }
  if (digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
  }

  return digits.slice(0, MOBILE_LENGTH);
}

export function isValidMobile(value: string): boolean {
  return MOBILE_PATTERN.test(value);
}

/** "9876543210" → "+91 **** 3210". Never throws on a partial number. */
export function maskMobile(value: string): string {
  const digits = value.replace(/\D/g, "");
  const tail = digits.slice(-4);
  return `${COUNTRY_CODE} **** ${tail}`;
}
