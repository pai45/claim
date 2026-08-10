"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppIcon } from "@/components/shared/AppIcon";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { useActivePersona } from "@/features/persona/useActivePersona";
import {
  addBeneficiaryLimit,
  beneficiaryFromDraft,
  createBeneficiaryLimitId,
  createDefaultBeneficiaryLimitState,
  draftFromBeneficiary,
  loadBeneficiaryLimitState,
  resolveBeneficiaryAccount,
  saveBeneficiaryLimitState,
  updateBeneficiaryLimit,
  validateBeneficiaryLimitDraft,
  type BeneficiaryAccount,
  type BeneficiaryLimitDraft,
  type BeneficiaryLimitField,
} from "@/features/beneficiary-limits/store";
import { UPI_SETTINGS_ASSETS } from "@/lib/ui/assets";

const EMPTY_DRAFT: BeneficiaryLimitDraft = {
  upiId: "",
  name: "",
  monthlyLimit: "",
  perTransactionLimit: "",
};

export function BeneficiaryLimitFormScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { persona } = useActivePersona();
  const allowedAccounts = useMemo<BeneficiaryAccount[]>(
    () => [
      ...(persona.access.products.ebPlus ? (["benefits"] as const) : []),
      ...(persona.access.products.plusPay ? (["pluspay"] as const) : []),
    ],
    [persona.access.products.ebPlus, persona.access.products.plusPay],
  );
  const account = resolveBeneficiaryAccount(
    searchParams.get("account"),
    allowedAccounts,
  );
  const beneficiaryId = searchParams.get("id");
  const editing = Boolean(beneficiaryId);
  const cameFromUpiSettings =
    searchParams.get("source") === "upi-settings";
  const returnsToListHistory = searchParams.get("returnTo") === "list";
  const [state, setState] = useState(createDefaultBeneficiaryLimitState);
  const [draft, setDraft] = useState<BeneficiaryLimitDraft>(EMPTY_DRAFT);
  const [touched, setTouched] = useState<
    Partial<Record<BeneficiaryLimitField, boolean>>
  >({});
  const [hydrated, setHydrated] = useState(false);
  const listUrl = `/upi-settings/beneficiary-limits/?account=${account}${
    cameFromUpiSettings ? "&source=upi-settings" : ""
  }`;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const loaded = loadBeneficiaryLimitState();
      setState(loaded);
      if (beneficiaryId) {
        const beneficiary = loaded.accounts[account].find(
          (item) => item.id === beneficiaryId,
        );
        if (!beneficiary) {
          router.replace(listUrl);
          return;
        }
        setDraft(draftFromBeneficiary(beneficiary));
      }
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [account, beneficiaryId, listUrl, router]);

  const errors = useMemo(
    () =>
      validateBeneficiaryLimitDraft(
        draft,
        state.accounts[account],
        beneficiaryId ?? undefined,
      ),
    [account, beneficiaryId, draft, state.accounts],
  );
  const invalid = Object.keys(errors).length > 0;

  function updateField(field: BeneficiaryLimitField, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function touchField(field: BeneficiaryLimitField) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function returnToList() {
    if (returnsToListHistory) {
      router.back();
      return;
    }
    router.replace(listUrl);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hydrated || invalid) {
      setTouched({
        upiId: true,
        name: true,
        monthlyLimit: true,
        perTransactionLimit: true,
      });
      return;
    }

    const beneficiary = beneficiaryFromDraft(
      draft,
      beneficiaryId ?? createBeneficiaryLimitId(),
    );
    const latest = loadBeneficiaryLimitState();
    const nextState = editing
      ? updateBeneficiaryLimit(latest, account, beneficiary)
      : addBeneficiaryLimit(latest, account, beneficiary);
    saveBeneficiaryLimitState(nextState);
    returnToList();
  }

  return (
    <AppShell variant="surface" className="overflow-hidden bg-white">
      <ScreenHeader
        title={editing ? "Edit beneficiary" : "Register new beneficiary"}
        onBack={returnToList}
      />

      <form
        className="flex min-h-0 flex-1 flex-col bg-white"
        onSubmit={handleSubmit}
        noValidate
      >
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-5 pt-3">
          <div className="flex flex-col gap-4">
            <TextField
              id="beneficiary-upi-id"
              label="UPI ID"
              placeholder="e.g. john.smith@paytm"
              value={draft.upiId}
              error={touched.upiId ? errors.upiId : undefined}
              autoComplete="off"
              onChange={(value) => updateField("upiId", value)}
              onBlur={() => touchField("upiId")}
            />
            <TextField
              id="beneficiary-name"
              label="Beneficiary name"
              placeholder="e.g. John Smith"
              value={draft.name}
              error={touched.name ? errors.name : undefined}
              autoComplete="name"
              onChange={(value) => updateField("name", value)}
              onBlur={() => touchField("name")}
            />
            <div className="grid grid-cols-2 gap-3">
              <RupeeField
                id="beneficiary-monthly-limit"
                label="Monthly Limit"
                value={draft.monthlyLimit}
                error={touched.monthlyLimit ? errors.monthlyLimit : undefined}
                onChange={(value) => updateField("monthlyLimit", value)}
                onBlur={() => touchField("monthlyLimit")}
              />
              <RupeeField
                id="beneficiary-transaction-limit"
                label="Per Transaction"
                value={draft.perTransactionLimit}
                error={
                  touched.perTransactionLimit
                    ? errors.perTransactionLimit
                    : undefined
                }
                onChange={(value) =>
                  updateField("perTransactionLimit", value)
                }
                onBlur={() => touchField("perTransactionLimit")}
              />
            </div>
          </div>

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
            disabled={!hydrated || invalid}
          >
            {editing ? "Save changes" : "Add Limit"}
          </button>
        </footer>
      </form>
    </AppShell>
  );
}

function TextField({
  id,
  label,
  placeholder,
  value,
  error,
  autoComplete,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  autoComplete: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="type-field-label">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className="min-h-11 w-full rounded-control border border-input-border bg-input-soft px-3 py-2.5 text-body-sm font-bold text-pine outline-none transition-colors placeholder:font-normal placeholder:text-placeholder focus:border-pine"
      />
      <FieldError id={errorId} error={error} />
    </div>
  );
}

function RupeeField({
  id,
  label,
  value,
  error,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="type-field-label truncate">
        {label}
      </label>
      <div className="field-focus-shell flex min-h-11 items-center rounded-control border border-input-border bg-input-soft px-3">
        <span className="mr-1 text-body-sm font-bold text-ink-secondary">₹</span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          placeholder="7500"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
          onBlur={onBlur}
          className="min-w-0 w-full bg-transparent text-body-sm font-bold text-pine outline-none placeholder:font-normal placeholder:text-placeholder"
        />
      </div>
      <FieldError id={errorId} error={error} />
    </div>
  );
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="text-caption text-danger" role="alert">
      {error}
    </p>
  );
}
