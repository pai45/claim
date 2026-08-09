import type { PaymentLimitAccount } from "@/features/payment-limits/store";

export function PaymentLimitAccountBadge({
  account,
}: {
  account: PaymentLimitAccount;
}) {
  return (
    <span className="inline-flex min-h-6 items-center rounded-pill bg-pine-primary px-2.5 py-1 text-caption font-bold leading-none text-white">
      {account === "pluspay" ? "ANQ" : "Benefits"}
    </span>
  );
}
