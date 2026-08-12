/**
 * Timing for the payment success sequence: processing → tick interstitial → paid to.
 *
 * Shared by the submit effect in `PaymentCheckoutFlow` and the choreography in
 * `scanPay.css`, so the CSS cannot drift out of sync with the timers.
 *
 * The interstitial is split across two technologies on purpose. The green circle is a
 * CSS `clip-path` on `.scan-pay-success-circle`, because Lottie clips every layer to
 * its own canvas and so can never draw a shape large enough to cover the screen. The
 * tick is `successTick.json`, rendered *above* that circle so it stays centred while
 * the green grows out past it. Its scale-in runs over frames 8–28 (60fps) to land as
 * the circle settles, and it is a centred scale rather than a trim-path draw — a trim
 * reveals the stroke from its first vertex, which parks the half-drawn tick left of
 * centre and reads as arriving after the circle.
 *
 * The circle's own 1.3s timeline (pop → hold → squash → cover) lives in the
 * `scan-pay-success-circle` keyframe. The tick must fade before the green dissolves at
 * 1.5s, or it reappears on top of the receipt.
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
