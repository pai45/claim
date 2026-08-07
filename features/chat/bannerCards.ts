import { formatINR } from "@/features/claims-history/constants";
import { getEmployerBenefit } from "@/features/policy/constants";
import type { BannerStage } from "./bannerRotation";

export type BannerCardId =
  | "vehicle_registration"
  | "driver_registration"
  | "internet_bill_due"
  | "internet_bill_rejected";

export type BannerAction =
  /** Hands the turn to the assistant for vehicle registration. */
  | { kind: "vehicle" }
  /** Hands the turn to the assistant for driver salary registration. */
  | { kind: "driver" }
  /** Opens the attach drawer so a fresh bill can be uploaded. */
  | { kind: "attach" }
  /** Opens the claim the notification is about. */
  | { kind: "claim"; claimId: string };

export type BannerCardContent = {
  id: BannerCardId;
  title: string;
  body: string;
  ctaLabel: string;
  /** `alert` paints the title in the danger tone; `promo` keeps it pine. */
  tone: "promo" | "alert";
  action: BannerAction;
};

export type RegistrationStatusOptions = {
  isVehicleRegistered?: boolean;
  isDriverRegistered?: boolean;
};

/**
 * The rejected internet bill the stage-3 notification points at. It is a real
 * row in `CLAIM_HISTORY_ITEMS`, so `getClaimDetails` resolves it instead of
 * falling through to the unrelated sample claim.
 */
export const REJECTED_BILL_CLAIM_ID = "CLM-124";

const INTERNET_BILL_AMOUNT = 899;

/** Genuinely 5 in the policy catalog — read it rather than restate it. */
const INTERNET_DEADLINE_DAY =
  getEmployerBenefit("mobile").claimRules.submissionDeadlineDay;

const BILL_DUE_CARD: BannerCardContent = {
  id: "internet_bill_due",
  // Kept to two lines in the card: the monthly billing date is context the
  // user already has, so only the amount and the deadline earn their space.
  title: "Your internet bill is due!",
  body: `July's ${formatINR(INTERNET_BILL_AMOUNT)} bill isn't claimed yet. Submit it before the ${INTERNET_DEADLINE_DAY}th.`,
  ctaLabel: "Upload Bill",
  tone: "promo",
  action: { kind: "attach" },
};

const BILL_REJECTED_CARD: BannerCardContent = {
  id: "internet_bill_rejected",
  title: `Your bill ${REJECTED_BILL_CLAIM_ID} was rejected`,
  body: "Your July internet bill claim was rejected due to policy changes.",
  ctaLabel: "Replace Bill",
  tone: "alert",
  action: { kind: "claim", claimId: REJECTED_BILL_CLAIM_ID },
};

/**
 * The vehicle promo stays last at every stage: it is evergreen, so a fresh
 * notification should always be the card the user lands on.
 */
const VEHICLE_CARD: BannerCardContent = {
  id: "vehicle_registration",
  title: "Vehicle Registration",
  body: "Register your vehicle for tax benefits.",
  ctaLabel: "Start registration",
  tone: "promo",
  action: { kind: "vehicle" },
};

/**
 * Once the vehicle is registered, the driver registration promo replaces the
 * vehicle promo until the driver is also registered.
 */
const DRIVER_CARD: BannerCardContent = {
  id: "driver_registration",
  title: "Driver Registration",
  body: "Register your driver to claim driver salary tax benefits.",
  ctaLabel: "Start registration",
  tone: "promo",
  action: { kind: "driver" },
};

const NOTIFICATION_CARDS: Record<BannerStage, BannerCardContent[]> = {
  1: [],
  2: [BILL_DUE_CARD],
  3: [BILL_REJECTED_CARD, BILL_DUE_CARD],
};

export function bannerCardsForStage(
  stage: BannerStage,
  options: RegistrationStatusOptions = {},
): BannerCardContent[] {
  const notifications = NOTIFICATION_CARDS[stage] ?? [];

  let promoCard: BannerCardContent | null = null;
  if (!options.isVehicleRegistered) {
    promoCard = VEHICLE_CARD;
  } else if (!options.isDriverRegistered) {
    promoCard = DRIVER_CARD;
  }

  return promoCard ? [...notifications, promoCard] : notifications;
}
