import type { QuickAction } from "./types";
import { EMPLOYER_BENEFITS_CATALOG } from "@/features/policy/constants";

export const USER_DISPLAY_NAME = "Akshay";

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "upload-bill",
    label: "Upload bill",
    intentId: "upload_bill",
    featured: true,
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
  {
    id: "claim-history",
    label: "Claim history",
    intentId: "claim_history",
  },
  {
    id: "merchant-locator",
    label: "Merchant locator",
    intentId: "merchant_locator",
  },
];

export const VEHICLE_REGISTRATION_INTENT = "vehicle_registration";

export const CLAIM_CATEGORIES = EMPLOYER_BENEFITS_CATALOG.benefits
  .filter((benefit) => benefit.id !== "driver")
  .map((benefit) => benefit.display.label)
  .concat("Other / HR review");

export type ClaimCategory = (typeof CLAIM_CATEGORIES)[number];
