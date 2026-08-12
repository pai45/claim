"use client";

import { useCallback, useState, type Dispatch } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BeneficiaryAddedSheet } from "@/components/bank-transfer/BeneficiaryAddedSheet";
import { PaymentCheckoutFlow } from "@/components/scan-pay/PaymentCheckoutFlow";
import { AppShell } from "@/components/shared/AppShell";
import { BackNavigationButton } from "@/components/shared/BackNavigationButton";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import {
  getBankBeneficiary,
  getBankBeneficiaryHistory,
  getSavedBankBeneficiaries,
  useBankTransferHistoryVersion,
  type BankBeneficiary,
  type BankTransferRecord,
} from "@/features/bank-transfer/history";
import {
  bankRecipientFromDraft,
  digitsOnly,
  formatBankTransferINR,
  maskAccountNumber,
  normalizeIfsc,
  validateBankRecipient,
  type BankRecipient,
  type BankRecipientDraft,
  type BankRecipientErrors,
} from "@/features/bank-transfer/validation";
import { useActivePersona } from "@/features/persona/useActivePersona";
import {
  createInitialBankTransferState,
  scanPayReducer,
} from "@/features/scan-pay/machine";
import type {
  ScanPayAction,
  ScanPayState,
} from "@/features/scan-pay/types";
import { staggerStyle } from "@/lib/ui/staggerStyle";

const EMPTY_RECIPIENT: BankRecipientDraft = {
  accountHolder: "",
  accountNumber: "",
  confirmAccountNumber: "",
  ifsc: "",
};

export function BankTransferScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { personaId } = useActivePersona();
  const historyVersion = useBankTransferHistoryVersion();
  void historyVersion;
  const beneficiaryId = searchParams.get("beneficiary");
  const beneficiaries = getSavedBankBeneficiaries(personaId);
  const selectedBeneficiary = beneficiaryId
    ? getBankBeneficiary(beneficiaryId, personaId)
    : undefined;
  const [recipient, setRecipient] = useState(EMPTY_RECIPIENT);
  const [recipientErrors, setRecipientErrors] =
    useState<BankRecipientErrors>({});
  const [registeredRecipient, setRegisteredRecipient] =
    useState<BankRecipient | null>(null);
  const [paymentState, setPaymentState] = useState<ScanPayState | null>(null);

  const dispatch = useCallback<Dispatch<ScanPayAction>>((action) => {
    setPaymentState((current) =>
      current ? scanPayReducer(current, action) : current,
    );
  }, []);

  function updateRecipient(
    field: keyof BankRecipientDraft,
    value: string,
  ) {
    setRecipient((current) => ({ ...current, [field]: value }));
    setRecipientErrors((current) => ({ ...current, [field]: undefined }));
  }

  function continueRecipient() {
    const errors = validateBankRecipient(recipient);
    setRecipientErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setRegisteredRecipient(bankRecipientFromDraft(recipient));
  }

  function startPayment(bankRecipient: BankRecipient) {
    setPaymentState(createInitialBankTransferState(bankRecipient));
  }

  function continueFromRegistration() {
    if (!registeredRecipient) return;
    startPayment(registeredRecipient);
    setRegisteredRecipient(null);
  }

  function navigateToBeneficiary(beneficiary: BankBeneficiary) {
    router.push(
      `/bank-transfer/?beneficiary=${encodeURIComponent(beneficiary.id)}`,
    );
  }

  function closeBeneficiary() {
    router.push("/bank-transfer/");
  }

  if (paymentState) {
    return (
      <PaymentCheckoutFlow
        state={paymentState}
        dispatch={dispatch}
        onConfirmBack={() => setPaymentState(null)}
        onClose={() => router.push("/")}
      />
    );
  }

  if (selectedBeneficiary) {
    return (
      <BankBeneficiaryHistoryScreen
        beneficiary={selectedBeneficiary}
        records={getBankBeneficiaryHistory(
          selectedBeneficiary.id,
          personaId,
        )}
        onBack={closeBeneficiary}
        onPayAgain={() => startPayment(selectedBeneficiary)}
        onTransaction={(transactionId) =>
          router.push(
            `/transaction-details/?id=${encodeURIComponent(transactionId)}&mode=benefits`,
          )
        }
      />
    );
  }

  return (
    <AppShell className="overflow-hidden bg-surface">
      <ScreenHeader
        title="Bank Transfer"
        onBack={() => router.push("/")}
      />
      <main className="min-h-0 flex-1 overflow-y-auto px-page pb-8 pt-5">
        <BankTransferRecipientForm
          recipient={recipient}
          errors={recipientErrors}
          beneficiaries={beneficiaries}
          onChange={updateRecipient}
          onContinue={continueRecipient}
          onBeneficiary={navigateToBeneficiary}
        />
      </main>
      <BeneficiaryAddedSheet
        open={Boolean(registeredRecipient)}
        accountHolder={registeredRecipient?.accountHolder ?? ""}
        onClose={() => setRegisteredRecipient(null)}
        onContinue={continueFromRegistration}
      />
    </AppShell>
  );
}

export function BankTransferRecipientForm({
  recipient,
  errors,
  beneficiaries = [],
  onChange,
  onContinue,
  onBeneficiary = () => {},
}: {
  recipient: BankRecipientDraft;
  errors: BankRecipientErrors;
  beneficiaries?: BankBeneficiary[];
  onChange: (field: keyof BankRecipientDraft, value: string) => void;
  onContinue: () => void;
  onBeneficiary?: (beneficiary: BankBeneficiary) => void;
}) {
  return (
    <section>
      <h2 className="type-section-title">Register New Beneficiary</h2>
      <p className="mt-1 type-body-secondary">
        Enter the bank details exactly as they appear on the account.
      </p>
      <div className="mt-5 flex flex-col gap-4">
        <Field
          label="Account holder name"
          id="account-holder"
          value={recipient.accountHolder}
          error={errors.accountHolder}
          autoComplete="name"
          onChange={(value) => onChange("accountHolder", value)}
        />
        <Field
          label="Account number"
          id="account-number"
          value={recipient.accountNumber}
          error={errors.accountNumber}
          inputMode="numeric"
          autoComplete="off"
          onChange={(value) => onChange("accountNumber", digitsOnly(value))}
        />
        <Field
          label="Re-enter account number"
          id="confirm-account-number"
          value={recipient.confirmAccountNumber}
          error={errors.confirmAccountNumber}
          inputMode="numeric"
          autoComplete="off"
          onChange={(value) =>
            onChange("confirmAccountNumber", digitsOnly(value))
          }
        />
        <Field
          label="IFSC code"
          id="ifsc"
          value={recipient.ifsc}
          error={errors.ifsc}
          autoCapitalize="characters"
          autoComplete="off"
          placeholder="e.g. HDFC0001234"
          onChange={(value) => onChange("ifsc", normalizeIfsc(value))}
        />
      </div>
      <button
        type="button"
        className="btn-primary mt-6"
        onClick={onContinue}
      >
        Continue
      </button>

      {beneficiaries.length ? (
        <SavedBankBeneficiaryList
          beneficiaries={beneficiaries}
          onBeneficiary={onBeneficiary}
        />
      ) : null}
    </section>
  );
}

export function SavedBankBeneficiaryList({
  beneficiaries,
  onBeneficiary,
}: {
  beneficiaries: BankBeneficiary[];
  onBeneficiary: (beneficiary: BankBeneficiary) => void;
}) {
  return (
    <section className="mt-6 border-t border-border-soft pt-6">
      <h2 className="type-section-title mb-3 text-ink">
        Saved Beneficiaries
      </h2>
      <div className="flex flex-col gap-3">
        {beneficiaries.map((beneficiary, index) => (
          <button
            key={beneficiary.id}
            type="button"
            onClick={() => onBeneficiary(beneficiary)}
            style={staggerStyle(index)}
            className="animate-rise-in flex min-h-16 w-full items-center justify-between rounded-card border border-border-line bg-white p-card text-left shadow-card transition-transform active:scale-[0.99]"
          >
            <span className="flex min-w-0 items-center gap-3">
              <BankBeneficiaryAvatar beneficiary={beneficiary} />
              <span className="min-w-0">
                <span className="type-body block truncate font-bold text-ink">
                  {beneficiary.accountHolder}
                </span>
                <span className="type-body-secondary mt-0.5 block truncate">
                  A/C {maskAccountNumber(beneficiary.accountNumber)} ·{" "}
                  {beneficiary.ifsc}
                </span>
              </span>
            </span>
            <ChevronIcon className="shrink-0 text-mint" />
          </button>
        ))}
      </div>
    </section>
  );
}

export function BankBeneficiaryHistoryScreen({
  beneficiary,
  records,
  onBack,
  onPayAgain,
  onTransaction,
}: {
  beneficiary: BankBeneficiary;
  records: BankTransferRecord[];
  onBack: () => void;
  onPayAgain: () => void;
  onTransaction: (transactionId: string) => void;
}) {
  const groups = groupHistory(records);

  return (
    <AppShell className="overflow-hidden bg-white">
      <header className="relative flex shrink-0 items-center px-page pb-2 pt-2">
        <BackNavigationButton
          onClick={onBack}
          ariaLabel="Back to saved beneficiaries"
        />
        <h1 className="type-screen-title pointer-events-none absolute left-0 right-0 text-center text-ink">
          Account
        </h1>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-4 pt-1">
        <section className="animate-rise-in flex flex-col items-center text-center">
          <BankBeneficiaryAvatar beneficiary={beneficiary} large />
          <h2 className="type-section-title mt-3 text-ink">
            {beneficiary.accountHolder}
          </h2>
          <p className="type-body-secondary mt-1">
            A/C {maskAccountNumber(beneficiary.accountNumber)} ·{" "}
            {beneficiary.ifsc}
          </p>
        </section>

        <div className="mt-5 flex flex-col gap-4">
          {groups.map(([dateLabel, groupRecords], groupIndex) => (
            <section
              key={dateLabel}
              className="animate-rise-in"
              style={staggerStyle(groupIndex + 1)}
              aria-labelledby={`bank-history-${groupIndex}`}
            >
              <h3
                id={`bank-history-${groupIndex}`}
                className="type-body-secondary mb-2 text-center"
              >
                {dateLabel}
              </h3>
              <div className="flex flex-col gap-2">
                {groupRecords.map((record) => (
                  <button
                    key={record.transaction.paymentGroupId}
                    type="button"
                    onClick={() =>
                      onTransaction(record.transaction.transactionId)
                    }
                    className="flex min-h-14 w-full items-center justify-between rounded-card border border-success-border bg-white px-card py-3 text-left shadow-card transition-transform active:scale-[0.99]"
                  >
                    <span className="min-w-0">
                      <span className="type-amount block text-ink">
                        {formatBankTransferINR(record.transaction.amount)}
                      </span>
                      <span className="mt-1 block truncate text-caption text-ink-secondary">
                        {formatTime(record.createdAt)} · Bank Transfer
                      </span>
                    </span>
                    <ChevronIcon className="shrink-0 text-mint" />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="shrink-0 rounded-t-bubble bg-white px-page pb-5 pt-4 shadow-drawer">
        <button type="button" className="btn-primary" onClick={onPayAgain}>
          Pay Again
        </button>
      </footer>
    </AppShell>
  );
}

function BankBeneficiaryAvatar({
  beneficiary,
  large = false,
}: {
  beneficiary: BankBeneficiary;
  large?: boolean;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-pill bg-pine-primary font-display font-bold text-white shadow-icon ${
        large ? "h-20 w-20 text-title" : "h-11 w-11 text-body"
      }`}
      aria-hidden="true"
    >
      {beneficiary.initials}
    </span>
  );
}

function Field({
  label,
  id,
  value,
  error,
  onChange,
  ...inputProps
}: {
  label: string;
  id: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
} & Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  "inputMode" | "autoComplete" | "autoCapitalize" | "placeholder"
>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="type-field-label">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`min-h-11 w-full rounded-control border bg-input-soft px-3 py-2.5 text-body-sm font-bold text-pine outline-none placeholder:font-normal placeholder:text-placeholder focus:border-pine ${
          error ? "border-danger" : "border-input-border"
        }`}
        {...inputProps}
      />
      {error ? (
        <p id={`${id}-error`} className="text-caption text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="m9 18 6-6-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function groupHistory(
  records: BankTransferRecord[],
): [string, BankTransferRecord[]][] {
  const groups = new Map<string, BankTransferRecord[]>();
  for (const record of records) {
    const label = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      timeZone: "UTC",
    }).format(new Date(record.createdAt));
    groups.set(label, [...(groups.get(label) ?? []), record]);
  }
  return [...groups.entries()];
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(new Date(value));
}
