"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PaymentLimitAccountBadge } from "@/components/payment-limits/PaymentLimitAccountBadge";
import { AppIcon } from "@/components/shared/AppIcon";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import {
  PAYMENT_LIMIT_AUDIENCE_LABELS,
  PAYMENT_LIMIT_METRIC_DETAILS,
} from "@/features/payment-limits/config";
import {
  PAYMENT_LIMIT_AUDIENCES,
  PAYMENT_LIMIT_METRICS,
  createDefaultPaymentLimitState,
  formatPaymentLimit,
  loadPaymentLimitState,
  resolvePaymentLimitAccount,
  type PaymentLimitAccount,
  type PaymentLimitAudience,
  type PaymentLimitMetric,
  type PaymentLimitValues,
} from "@/features/payment-limits/store";
import { useActivePersona } from "@/features/persona/useActivePersona";
import { UPI_SETTINGS_ASSETS } from "@/lib/ui/assets";
import { colors } from "@/lib/ui/colors";
import { staggerStyle } from "@/lib/ui/staggerStyle";

export function PaymentLimitsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { persona } = useActivePersona();
  const allowedAccounts = useMemo<PaymentLimitAccount[]>(
    () => [
      ...(persona.access.products.ebPlus ? (["benefits"] as const) : []),
      ...(persona.access.products.plusPay ? (["pluspay"] as const) : []),
    ],
    [persona.access.products.ebPlus, persona.access.products.plusPay],
  );
  const account = resolvePaymentLimitAccount(
    searchParams.get("account"),
    allowedAccounts,
  );
  const cameFromUpiSettings = searchParams.get("source") === "upi-settings";
  const sourceQuery = cameFromUpiSettings ? "&source=upi-settings" : "";
  const [state, setState] = useState(createDefaultPaymentLimitState);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setState(loadPaymentLimitState());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function editLimit(
    audience: PaymentLimitAudience,
    metric: PaymentLimitMetric,
  ) {
    router.push(
      `/upi-settings/payment-limits/edit/?account=${account}${sourceQuery}&returnTo=list&audience=${audience}&metric=${metric}`,
    );
  }

  function goBack() {
    if (cameFromUpiSettings) {
      router.back();
      return;
    }
    router.replace(`/upi-settings/?tab=${account}`);
  }

  return (
    <AppShell variant="surface" className="overflow-hidden bg-white">
      <ScreenHeader
        title="Payment Limits"
        titleAccessory={<PaymentLimitAccountBadge account={account} />}
        onBack={goBack}
      />

      <main className="flex min-h-0 flex-1 flex-col gap-section overflow-y-auto bg-white px-5 pb-8 pt-4">
        {PAYMENT_LIMIT_AUDIENCES.map((audience, index) => (
          <PaymentAudienceSection
            key={audience}
            audience={audience}
            values={state.accounts[account][audience]}
            onEdit={(metric) => editLimit(audience, metric)}
            style={staggerStyle(index)}
          />
        ))}
      </main>
    </AppShell>
  );
}

function PaymentAudienceSection({
  audience,
  values,
  onEdit,
  style,
}: {
  audience: PaymentLimitAudience;
  values: PaymentLimitValues;
  onEdit: (metric: PaymentLimitMetric) => void;
  style: CSSProperties;
}) {
  const icon =
    audience === "individuals"
      ? UPI_SETTINGS_ASSETS.paymentIndividuals
      : UPI_SETTINGS_ASSETS.paymentMerchants;

  return (
    <section className="animate-rise-in" style={style}>
      <div className="flex min-h-8 items-center gap-3">
        <AppIcon src={icon} alt="" size={24} />
        <h2 className="type-body text-pine">
          {PAYMENT_LIMIT_AUDIENCE_LABELS[audience]}
        </h2>
      </div>

      <div className="mt-2 overflow-hidden rounded-card border border-mint bg-white">
        {PAYMENT_LIMIT_METRICS.map((metric, index) => (
          <button
            key={metric}
            type="button"
            onClick={() => onEdit(metric)}
            className={`grid min-h-14 w-full grid-cols-[minmax(0,1fr)_auto_20px] items-center gap-3 px-3 text-left transition-colors active:bg-surface-tint ${
              index === PAYMENT_LIMIT_METRICS.length - 1
                ? ""
                : "border-b border-border-soft"
            }`}
            aria-label={`${PAYMENT_LIMIT_METRIC_DETAILS[metric].label}, ${formatPaymentLimit(metric, values[metric])}`}
          >
            <span className="truncate text-body-sm text-ink">
              {PAYMENT_LIMIT_METRIC_DETAILS[metric].label}
            </span>
            <span className="text-body-sm text-pine">
              {formatPaymentLimit(metric, values[metric])}
            </span>
            <LimitChevron />
          </button>
        ))}
      </div>
    </section>
  );
}

function LimitChevron() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9.5 6.5 15 12l-5.5 5.5"
        stroke={colors.mint}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
