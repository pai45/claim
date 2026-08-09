"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppIcon } from "@/components/shared/AppIcon";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { DeleteBeneficiaryDialog } from "@/components/beneficiary-limits/DeleteBeneficiaryDialog";
import { useActivePersona } from "@/features/persona/useActivePersona";
import {
  createDefaultBeneficiaryLimitState,
  deleteBeneficiaryLimit,
  formatBeneficiaryLimit,
  loadBeneficiaryLimitState,
  resolveBeneficiaryAccount,
  saveBeneficiaryLimitState,
  type BeneficiaryAccount,
  type BeneficiaryLimit,
} from "@/features/beneficiary-limits/store";
import { UPI_SETTINGS_ASSETS } from "@/lib/ui/assets";
import { colors } from "@/lib/ui/colors";
import { staggerStyle } from "@/lib/ui/staggerStyle";

export function BeneficiaryLimitsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { persona } = useActivePersona();
  const allowedAccounts = useMemo<BeneficiaryAccount[]>(
    () => [
      ...(persona.access.products.lens ? (["benefits"] as const) : []),
      ...(persona.access.products.plusPay ? (["pluspay"] as const) : []),
    ],
    [persona.access.products.lens, persona.access.products.plusPay],
  );
  const account = resolveBeneficiaryAccount(
    searchParams.get("account"),
    allowedAccounts,
  );
  const cameFromUpiSettings =
    searchParams.get("source") === "upi-settings";
  const sourceQuery = cameFromUpiSettings ? "&source=upi-settings" : "";
  const [state, setState] = useState(createDefaultBeneficiaryLimitState);
  const [pendingDelete, setPendingDelete] = useState<BeneficiaryLimit | null>(
    null,
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setState(loadBeneficiaryLimitState());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const beneficiaries = state.accounts[account];

  function confirmDelete() {
    if (!pendingDelete) return;
    const nextState = deleteBeneficiaryLimit(
      state,
      account,
      pendingDelete.id,
    );
    setState(nextState);
    saveBeneficiaryLimitState(nextState);
    setPendingDelete(null);
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
        title="Beneficiary Limits"
        onBack={goBack}
      >
        <AccountBadge account={account} />
      </ScreenHeader>

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white px-page pb-5 pt-2">
        {beneficiaries.length ? (
          <div className="flex flex-col gap-3">
            {beneficiaries.map((beneficiary, index) => (
              <BeneficiaryLimitCard
                key={beneficiary.id}
                beneficiary={beneficiary}
                onEdit={() =>
                  router.push(
                    `/upi-settings/beneficiary-limits/form/?account=${account}${sourceQuery}&returnTo=list&id=${encodeURIComponent(beneficiary.id)}`,
                  )
                }
                onDelete={() => setPendingDelete(beneficiary)}
                style={staggerStyle(index)}
              />
            ))}
          </div>
        ) : (
          <EmptyBeneficiaryState />
        )}

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
          type="button"
          className="btn-primary shadow-cta"
          onClick={() =>
            router.push(
              `/upi-settings/beneficiary-limits/form/?account=${account}${sourceQuery}&returnTo=list`,
            )
          }
        >
          Register new beneficiary
        </button>
      </footer>

      <DeleteBeneficiaryDialog
        open={Boolean(pendingDelete)}
        beneficiaryName={pendingDelete?.name ?? ""}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </AppShell>
  );
}

function AccountBadge({ account }: { account: BeneficiaryAccount }) {
  return (
    <span className="rounded-pill bg-pine-primary px-2.5 py-1 text-caption font-bold text-white">
      {account === "pluspay" ? "ANQ" : "Benefits"}
    </span>
  );
}

function BeneficiaryLimitCard({
  beneficiary,
  onEdit,
  onDelete,
  style,
}: {
  beneficiary: BeneficiaryLimit;
  onEdit: () => void;
  onDelete: () => void;
  style: ReturnType<typeof staggerStyle>;
}) {
  const titleId = `beneficiary-${beneficiary.id}`;

  return (
    <article
      aria-labelledby={titleId}
      style={style}
      className="animate-rise-in rounded-card border border-mint bg-white p-3 shadow-card"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 pt-1">
          <h2 id={titleId} className="type-body font-bold text-pine">
            {beneficiary.name}
          </h2>
          <p className="mt-1 truncate text-caption text-ink-secondary">
            UPI ID : {beneficiary.upiId}
          </p>
        </div>
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            aria-label={`Edit limits for ${beneficiary.name}`}
            onClick={onEdit}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-control text-pine active:bg-surface-tint"
          >
            <AppIcon
              src={UPI_SETTINGS_ASSETS.editBeneficiary}
              alt=""
              size={24}
            />
          </button>
          <button
            type="button"
            aria-label={`Delete limits for ${beneficiary.name}`}
            onClick={onDelete}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-control text-pine active:bg-danger-soft"
          >
            <AppIcon
              src={UPI_SETTINGS_ASSETS.deleteBeneficiary}
              alt=""
              size={24}
            />
          </button>
        </div>
      </div>

      <dl className="mt-2 grid grid-cols-2 gap-4 rounded-control bg-surface-muted px-3 py-3">
        <div>
          <dt className="text-caption text-ink-secondary">Monthly Limit</dt>
          <dd className="mt-2 text-body-sm font-bold text-pine">
            {formatBeneficiaryLimit(beneficiary.monthlyLimit)}
          </dd>
        </div>
        <div>
          <dt className="text-caption text-ink-secondary">Per Transaction</dt>
          <dd className="mt-2 text-body-sm font-bold text-pine">
            {formatBeneficiaryLimit(beneficiary.perTransactionLimit)}
          </dd>
        </div>
      </dl>
    </article>
  );
}

function EmptyBeneficiaryState() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-control bg-surface-tint text-pine-primary shadow-icon">
        <UsersIcon />
      </span>
      <h2 className="type-section-title mt-4 text-pine">
        No beneficiary limits yet
      </h2>
      <p className="mt-2 type-body-secondary">
        Register a beneficiary to set monthly and per-transaction limits.
      </p>
    </section>
  );
}

function UsersIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20v-1.3A4.7 4.7 0 0 1 7.2 14h2.6a4.7 4.7 0 0 1 4.7 4.7V20M16 11.5a3 3 0 0 0 0-6M16.5 14.2a4.2 4.2 0 0 1 5 4.1V20"
        stroke={colors.pinePrimary}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
