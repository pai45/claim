import type { PersonaId } from "@/features/persona/types";
import { hasReturningAccountState } from "@/features/persona/constants";

export type NotificationAction =
  | {
      kind: "assistant";
      intentId: "upload_bill" | "vehicle_registration" | "driver_registration";
      label: "Upload bill" | "Start registration" | "Register driver";
    }
  | {
      kind: "claim";
      claimId: string;
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
    action: {
      kind: "assistant",
      intentId: "vehicle_registration",
      label: "Start registration",
    },
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
    id: "internet-bill-due",
    title: "Your internet bill is due",
    body: "July's ₹899 bill isn't claimed yet. Submit it before the 5th.",
    dateLabel: "Today",
    tone: "warning",
    action: {
      kind: "assistant",
      intentId: "upload_bill",
      label: "Upload bill",
    },
  },
  {
    id: "claim-clm-124-rejected",
    title: "Your bill CLM-124 was rejected",
    body: "Your July internet bill claim was rejected due to policy changes.",
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
  {
    id: "claim-clm-45201-under-review",
    title: "Your claim is under review",
    body: "Your ₹1,299 Airtel Broadband claim CLM-45201 is being reviewed.",
    dateLabel: "12 May 2026",
    tone: "default",
    action: { kind: "claim", claimId: "CLM-45201" },
  },
];

export const RETURNING_NOTIFICATION_COUNT = RETURNING_NOTIFICATIONS.length;

export function getNotificationsForPersona(
  personaId: PersonaId,
): BenefitsNotification[] {
  if (!hasReturningAccountState(personaId)) return [];
  return RETURNING_NOTIFICATIONS;
}
