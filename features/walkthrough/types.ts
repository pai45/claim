export type WalkthroughId =
  | "eb-home"
  | "benefits-assistant"
  | "rohan-eb-plus-setup"
  | "product-switcher";

export type WalkthroughPhase = "idle" | "running" | "paused" | "done";

export type WalkthroughStep = {
  /**
   * Stable identity for the step. For `eb-home` this doubles as the
   * `data-walkthrough` value looked up inside the iframe document.
   */
  key: string;
  eyebrow: string;
  title: string;
  body: string;
  /** Target-led steps advance through the highlighted control, not card buttons. */
  advanceOn?: "controls" | "target";
};

/** Viewport-relative box of a spotlit target, in host coordinates. */
export type WalkthroughRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};
