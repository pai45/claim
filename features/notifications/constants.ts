import type { PersonaId } from "@/features/persona/types";
import { hasReturningAccountState } from "@/features/persona/constants";

export type NotificationAction =
  | {
      kind: "assistant";
      intentId: "upload_claim" | "vehicle_registration" | "driver_registration";
      label: "Upload claim" | "Start registration" | "Register driver";
    }
  | {
      kind: "claim";
      claimId: string;
    }
  | {
      /** Opens a full-page screen instead of handing an intent to the assistant. */
      kind: "route";
      href: string;
    };

export type BenefitsNotification = {
  id: string;
  title: string;
  body: string;
  dateLabel: string;
  tone: "default" | "success" | "warning" | "danger";
  action: NotificationAction;
};

export const RETURNING_NOTIFICATIONS: BenefitsNotification[] = [
  {
    id: "vehicle-registration-failed",
    title: "Vehicle registration failed",
    body: "We couldn't register your vehicle. Review the details and try again.",
    dateLabel: "Today",
    tone: "danger",
    // The vehicle screen explains why it failed; restarting the wizard from here
    // would drop the user into a form with no idea what to change.
    action: { kind: "route", href: "/vehicle/" },
  },
  {
    id: "driver-registration-failed",
    title: "Driver registration failed",
    body: "We couldn't register your driver. Review the details and try again.",
    dateLabel: "Today",
    tone: "danger",
    action: {
      kind: "assistant",
      intentId: "driver_registration",
      label: "Register driver",
    },
  },
  {
    id: "internet-claim-due",
    title: "Your internet claim is pending",
    body: "July's ₹899 claim isn't submitted yet. Submit it before the 5th.",
    dateLabel: "Today",
    tone: "warning",
    action: {
      kind: "assistant",
      intentId: "upload_claim",
      label: "Upload claim",
    },
  },
  {
    id: "claim-clm-124-rejected",
    title: "Your claim CLM-124 was rejected",
    body: "Your July internet claim was rejected due to policy changes.",
    dateLabel: "05 Jul 2026",
    tone: "danger",
    action: { kind: "claim", claimId: "CLM-124" },
  },
  {
    id: "claim-clm-45188-needs-info",
    title: "More information is needed",
    body: "Your Indian Oil fuel claim CLM-45188 needs additional information.",
    dateLabel: "11 May 2026",
    tone: "warning",
    action: { kind: "claim", claimId: "CLM-45188" },
  },
  {
    id: "claim-clm-45140-approved",
    title: "Your claim was approved",
    body: "Your ₹7,999 Coursera claim CLM-45140 has been approved.",
    dateLabel: "03 May 2026",
    tone: "success",
    action: { kind: "claim", claimId: "CLM-45140" },
  },
];

export const RETURNING_NOTIFICATION_COUNT = RETURNING_NOTIFICATIONS.length;

export function getDraftClaimsNotification(
  draftCount: number,
): BenefitsNotification | null {
  if (draftCount <= 0) return null;
  const claimLabel = draftCount === 1 ? "claim" : "claims";

  return {
    id: "claims-in-draft",
    title: `${draftCount} ${claimLabel} in draft`,
    body: "Review your saved claim details and submit when you’re ready.",
    dateLabel: "Now",
    tone: "default",
    action: { kind: "route", href: "/chat-drafts" },
  };
}

export function getNotificationsForPersona(
  personaId: PersonaId,
): BenefitsNotification[] {
  if (!hasReturningAccountState(personaId)) return [];
  return RETURNING_NOTIFICATIONS;
}
