import type { QuickAction } from "./types";
import { EMPLOYER_BENEFITS_CATALOG } from "@/features/policy/constants";

export const USER_DISPLAY_NAME = "Akshay";

/**
 * Order matters — the row is a single horizontal scroller, so the first three
 * are what fit on screen. Dashboard and policy stay reachable by scrolling.
 */
export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "upload-bill",
    label: "Upload bill",
    intentId: "upload_bill",
    featured: true,
  },
  {
    id: "claim-history",
    label: "Claim history",
    intentId: "claim_history",
  },
  {
    id: "merchant-locator",
    label: "Meals merchant",
    intentId: "merchant_locator",
  },
  {
    id: "view-dashboard",
    label: "View dashboard",
    intentId: "view_dashboard",
  },
  {
    id: "view-policy",
    label: "View policy",
    intentId: "view_policy",
  },
];

export const VEHICLE_REGISTRATION_INTENT = "vehicle_registration";

/** The turn that starts the flow, shared by the chat CTA and the full-page CTAs. */
export const VEHICLE_REGISTRATION_LABEL = "Start registration";

export const CLAIM_CATEGORIES = EMPLOYER_BENEFITS_CATALOG.benefits
  .filter((benefit) => benefit.id !== "driver")
  .map((benefit) => benefit.display.label)
  .concat("Other / HR review");

export type ClaimCategory = (typeof CLAIM_CATEGORIES)[number];
