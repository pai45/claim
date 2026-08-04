/**
 * Rendered as buttons, not anchors: neither a Terms nor a Privacy page exists
 * in this app yet, and `href="#"` would announce as a link that goes nowhere.
 * Swap to real anchors once the URLs exist.
 */
export function LegalLine() {
  return (
    <p className="text-caption leading-snug text-ink-secondary">
      By continuing, you agree to our{" "}
      <button
        type="button"
        className="font-bold text-pine-primary underline underline-offset-2"
      >
        Terms of Service
      </button>{" "}
      &amp;{" "}
      <button
        type="button"
        className="font-bold text-pine-primary underline underline-offset-2"
      >
        Privacy Policy
      </button>
    </p>
  );
}
