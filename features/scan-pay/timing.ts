/**
 * Timing for the payment success sequence: processing → tick interstitial → paid to.
 *
 * Shared by the submit effect in `PaymentCheckoutFlow` and the choreography in
 * `scanPay.css`, so the CSS cannot drift out of sync with the timers.
 *
 * The whole interstitial — circle, tick and halo — runs on one 1.3s `linear` CSS
 * timeline (`scan-pay-success-circle`, `-tick-in`, `-halo`), so a given percentage is
 * the same instant for all three. It used to mix a CSS circle with a Lottie tick, and
 * because Lottie drives its own rAF loop the two desynced on a throttled device: the
 * tick hit full size while the circle was still small and overhung it. One clock means
 * dropped frames hit everything equally. The tick is also clipped to the circle, so
 * overflow is impossible even under drift.
 *
 * The circle's timeline is pop → hold → squash → cover. The tick must fade before the
 * green dissolves at 1.5s, or it reappears on top of the receipt.
 */

/** How long `submitting` runs before the ledger commits. */
export const SUBMIT_DELAY_MS = 2000;

/** How long the tick overlay stays mounted, from first frame to unmount. */
export const SUCCESS_VEIL_MS = 2000;

/**
 * How far into the overlay `RESOLVE_PAYMENT` is deferred to. The opaque white veil is
 * what hides the step swap — it does not start fading until 1450ms, by which point the
 * green has fully covered — so this has to land comfortably before that.
 */
export const SUCCESS_COVER_MS = 1000;

/**
 * Delay added to every paid-to entrance animation when the screen arrives behind the
 * veil. Measured from when the screen *mounts* (SUCCESS_COVER_MS into the overlay),
 * not from when the overlay appeared, so that its hero starts moving just as the green
 * begins dissolving at 1500ms. Back-navigation from payment details renders the same
 * screen with no veil in front of it, and passes 0 instead.
 */
export const PAID_ENTER_BASE_MS = 480;
