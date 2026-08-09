"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
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
  isAmountMetric,
  loadPaymentLimitState,
  parsePaymentLimitInput,
  resolvePaymentLimitAccount,
  resolvePaymentLimitAudience,
  resolvePaymentLimitMetric,
  savePaymentLimitState,
  updatePaymentLimit,
  validatePaymentLimitInput,
  type PaymentLimitAccount,
} from "@/features/payment-limits/store";
import { useActivePersona } from "@/features/persona/useActivePersona";
import { UPI_SETTINGS_ASSETS } from "@/lib/ui/assets";

export function PaymentLimitEditScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { persona } = useActivePersona();
  const allowedAccounts = useMemo<PaymentLimitAccount[]>(
    () => [
      ...(persona.access.products.lens ? (["benefits"] as const) : []),
      ...(persona.access.products.plusPay ? (["pluspay"] as const) : []),
    ],
    [persona.access.products.lens, persona.access.products.plusPay],
  );
  const account = resolvePaymentLimitAccount(
    searchParams.get("account"),
    allowedAccounts,
  );
  const audience = resolvePaymentLimitAudience(searchParams.get("audience"));
  const metric = resolvePaymentLimitMetric(searchParams.get("metric"));
  const cameFromUpiSettings = searchParams.get("source") === "upi-settings";
  const returnsToListHistory = searchParams.get("returnTo") === "list";
  const listUrl = `/upi-settings/payment-limits/?account=${account}${
    cameFromUpiSettings ? "&source=upi-settings" : ""
  }`;
  const [draft, setDraft] = useState("");
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [touched, setTouched] = useState(false);
  const error = validatePaymentLimitInput(draft);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (!audience || !metric) {
        router.replace(listUrl);
        return;
      }

      const state = loadPaymentLimitState();
      const value = state.accounts[account][audience][metric];
      setStoredValue(value);
      setDraft(value === null ? "" : String(value));
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [account, audience, listUrl, metric, router]);

  if (!audience || !metric) {
    return <div className="mx-auto h-dvh w-full max-w-phone bg-white" />;
  }

  function returnToList() {
    if (returnsToListHistory) {
      router.back();
      return;
    }
    router.replace(listUrl);
  }

  function saveValue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (!audience || !metric || !hydrated || error) return;

    const latest = loadPaymentLimitState();
    const nextState = updatePaymentLimit(
      latest,
      account,
      audience,
      metric,
      parsePaymentLimitInput(draft),
    );
    savePaymentLimitState(nextState);
    returnToList();
  }

  function removeValue() {
    if (!audience || !metric || !hydrated) return;
    const latest = loadPaymentLimitState();
    const nextState = updatePaymentLimit(
      latest,
      account,
      audience,
      metric,
      null,
    );
    savePaymentLimitState(nextState);
    returnToList();
  }

  const audienceIcon =
    audience === "individuals"
      ? UPI_SETTINGS_ASSETS.paymentIndividuals
      : UPI_SETTINGS_ASSETS.paymentMerchants;
  const errorId = "payment-limit-error";

  return (
    <AppShell variant="surface" className="overflow-hidden bg-white">
      <ScreenHeader
        title="Edit payment limit"
        titleAccessory={<PaymentLimitAccountBadge account={account} />}
        onBack={returnToList}
      />

      <form
        className="flex min-h-0 flex-1 flex-col bg-white"
        onSubmit={saveValue}
        noValidate
      >
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-5 pt-4">
          <section className="rounded-card border border-mint bg-white p-card shadow-card">
            <div className="flex items-center gap-3 border-b border-border-soft pb-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-surface-tint">
                <AppIcon src={audienceIcon} alt="" size={24} />
              </span>
              <div className="min-w-0">
                <p className="type-body font-bold text-pine">
                  {PAYMENT_LIMIT_AUDIENCE_LABELS[audience]}
                </p>
                <p className="mt-0.5 type-body-secondary">
                  {PAYMENT_LIMIT_METRIC_DETAILS[metric].label}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              <label htmlFor="payment-limit-value" className="type-field-label">
                {PAYMENT_LIMIT_METRIC_DETAILS[metric].inputLabel}
              </label>
              {isAmountMetric(metric) ? (
                <div className="field-focus-shell flex min-h-11 items-center rounded-control border border-input-border bg-input-soft px-3">
                  <span className="mr-2 text-body-sm font-bold text-ink-secondary">
                    ₹
                  </span>
                  <LimitInput
                    value={draft}
                    errorId={touched && error ? errorId : undefined}
                    invalid={Boolean(touched && error)}
                    onChange={setDraft}
                    onBlur={() => setTouched(true)}
                    className="min-w-0 w-full bg-transparent"
                  />
                </div>
              ) : (
                <LimitInput
                  value={draft}
                  errorId={touched && error ? errorId : undefined}
                  invalid={Boolean(touched && error)}
                  onChange={setDraft}
                  onBlur={() => setTouched(true)}
                  className="min-h-11 w-full rounded-control border border-input-border bg-input-soft px-3 py-2.5 focus:border-pine"
                />
              )}
              {touched && error ? (
                <p id={errorId} className="text-caption text-danger" role="alert">
                  {error}
                </p>
              ) : null}
              <p className="text-caption text-ink-secondary">
                Enter a positive whole number. You can remove the limit later.
              </p>
            </div>
          </section>

          <div className="mt-auto flex justify-center pb-1 pt-8">
            <AppIcon
              src={UPI_SETTINGS_ASSETS.poweredByUpi}
              alt="Powered by UPI"
              width={58}
              height={30}
              className="h-auto w-14 object-contain"
            />
          </div>
        </main>

        <footer className="shrink-0 rounded-t-bubble bg-white px-page pb-6 pt-3 shadow-drawer">
          <button
            type="submit"
            className="btn-primary shadow-cta"
            disabled={!hydrated || Boolean(error)}
          >
            Save limit
          </button>
          {storedValue !== null ? (
            <button
              type="button"
              className="btn-secondary mt-2"
              onClick={removeValue}
            >
              Remove limit
            </button>
          ) : null}
        </footer>
      </form>
    </AppShell>
  );
}

function LimitInput({
  value,
  invalid,
  errorId,
  className,
  onChange,
  onBlur,
}: {
  value: string;
  invalid: boolean;
  errorId?: string;
  className: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <input
      id="payment-limit-value"
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={15}
      value={value}
      placeholder="Enter limit"
      autoComplete="off"
      aria-invalid={invalid}
      aria-describedby={errorId}
      onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
      onBlur={onBlur}
      className={`${className} text-body-sm font-bold text-pine outline-none placeholder:font-normal placeholder:text-placeholder`}
    />
  );
}
