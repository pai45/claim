import type {
  PaymentLimitAudience,
  PaymentLimitMetric,
} from "@/features/payment-limits/store";

export const PAYMENT_LIMIT_AUDIENCE_LABELS: Record<
  PaymentLimitAudience,
  string
> = {
  individuals: "To Individuals",
  merchants: "To Merchants",
};

export const PAYMENT_LIMIT_METRIC_DETAILS: Record<
  PaymentLimitMetric,
  { label: string; inputLabel: string }
> = {
  amountPerDay: {
    label: "Amount per day",
    inputLabel: "Daily amount limit",
  },
  amountPerMonth: {
    label: "Amount per month",
    inputLabel: "Monthly amount limit",
  },
  transactionsPerDay: {
    label: "Transactions per day",
    inputLabel: "Daily transaction limit",
  },
  transactionsPerMonth: {
    label: "Transactions per month",
    inputLabel: "Monthly transaction limit",
  },
};
