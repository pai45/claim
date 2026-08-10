"use client";

import { useCallback, useState, type Dispatch } from "react";
import { useRouter } from "next/navigation";
import { PaymentCheckoutFlow } from "@/components/scan-pay/PaymentCheckoutFlow";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import {
  digitsOnly,
  normalizeIfsc,
  validateBankRecipient,
  type BankRecipientDraft,
  type BankRecipientErrors,
} from "@/features/bank-transfer/validation";
import {
  createInitialBankTransferState,
  scanPayReducer,
} from "@/features/scan-pay/machine";
import type {
  ScanPayAction,
  ScanPayState,
} from "@/features/scan-pay/types";

const EMPTY_RECIPIENT: BankRecipientDraft = {
  accountHolder: "",
  accountNumber: "",
  ifsc: "",
};

export function BankTransferScreen() {
  const router = useRouter();
  const [recipient, setRecipient] = useState(EMPTY_RECIPIENT);
  const [recipientErrors, setRecipientErrors] =
    useState<BankRecipientErrors>({});
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
    setPaymentState(createInitialBankTransferState(recipient));
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

  return (
    <AppShell className="overflow-hidden bg-surface">
      <ScreenHeader title="Bank Transfer" onBack={() => router.push("/")} />
      <main className="min-h-0 flex-1 overflow-y-auto px-page pb-8 pt-5">
        <BankTransferRecipientForm
          recipient={recipient}
          errors={recipientErrors}
          onChange={updateRecipient}
          onContinue={continueRecipient}
        />
      </main>
    </AppShell>
  );
}

export function BankTransferRecipientForm({
  recipient,
  errors,
  onChange,
  onContinue,
}: {
  recipient: BankRecipientDraft;
  errors: BankRecipientErrors;
  onChange: (field: keyof BankRecipientDraft, value: string) => void;
  onContinue: () => void;
}) {
  return (
    <section>
      <p className="type-field-label text-pine-primary">Recipient details</p>
      <h2 className="type-section-title mt-1">Who are you paying?</h2>
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
    </section>
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
