"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { BackNavigationButton } from "@/components/shared/BackNavigationButton";
import { useActivePersona } from "@/features/persona/useActivePersona";
import {
  digitsOnly,
  formatBankTransferINR,
  maskAccountNumber,
  normalizeIfsc,
  validateBankRecipient,
  validateBankTransferAmount,
  type BankRecipientDraft,
  type BankRecipientErrors,
} from "@/features/bank-transfer/validation";

type TransferStep = "recipient" | "amount" | "review" | "success";

const QUICK_AMOUNTS = [500, 1_000, 2_000, 5_000];

const BALANCE_BY_PERSONA = {
  returning: 18_650,
  new_user: 30_000,
  lens_only: 18_650,
  lens_no_upi: 18_650,
  pluspay_only: 0,
} as const;

const EMPTY_RECIPIENT: BankRecipientDraft = {
  accountHolder: "",
  accountNumber: "",
  confirmAccountNumber: "",
  ifsc: "",
};

export function BankTransferScreen() {
  const router = useRouter();
  const { personaId } = useActivePersona();
  const availableBalance = BALANCE_BY_PERSONA[personaId];
  const [step, setStep] = useState<TransferStep>("recipient");
  const [recipient, setRecipient] = useState(EMPTY_RECIPIENT);
  const [recipientErrors, setRecipientErrors] =
    useState<BankRecipientErrors>({});
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState("");

  function goBack() {
    if (step === "recipient" || step === "success") {
      router.push("/");
      return;
    }
    setStep(step === "review" ? "amount" : "recipient");
  }

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
    setStep("amount");
  }

  function continueAmount() {
    const error = validateBankTransferAmount(amount, availableBalance);
    setAmountError(error);
    if (error) return;
    setStep("review");
  }

  function confirmTransfer() {
    setReferenceId(`EB${Date.now().toString().slice(-10)}`);
    setStep("success");
  }

  function resetTransfer() {
    setRecipient(EMPTY_RECIPIENT);
    setRecipientErrors({});
    setAmount("");
    setNote("");
    setAmountError(null);
    setReferenceId("");
    setStep("recipient");
  }

  if (step === "success") {
    return (
      <AppShell className="overflow-hidden bg-surface">
        <main className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-page pb-8 pt-12 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-pill bg-success text-white shadow-icon" aria-hidden="true">
            <CheckIcon />
          </span>
          <p className="type-field-label mt-6 text-success">Transfer successful</p>
          <h1 className="type-hero mt-2 text-pine-dark">
            {formatBankTransferINR(Number(amount))}
          </h1>
          <p className="mt-2 type-body-secondary">
            Sent to <strong className="text-ink">{recipient.accountHolder}</strong>
          </p>

          <section className="mt-8 w-full rounded-card border border-border-line bg-white p-card text-left shadow-card" aria-label="Transfer receipt">
            <ReceiptRow label="Bank account" value={maskAccountNumber(recipient.accountNumber)} />
            <ReceiptRow label="IFSC" value={recipient.ifsc} />
            <ReceiptRow label="Reference ID" value={referenceId} />
            <ReceiptRow label="Status" value="Completed" success last />
          </section>
        </main>
        <footer className="shrink-0 border-t border-border-soft bg-white px-page pb-6 pt-3">
          <button type="button" className="btn-primary" onClick={() => router.push("/")}>Back to Home</button>
          <button type="button" className="mt-2 min-h-11 w-full rounded-control text-body-sm font-bold text-pine-primary" onClick={resetTransfer}>Make another transfer</button>
        </footer>
      </AppShell>
    );
  }

  return (
    <AppShell className="overflow-hidden bg-surface">
      <header className="relative flex shrink-0 items-center px-page pb-3 pt-2">
        <BackNavigationButton onClick={goBack} ariaLabel="Back" />
        <h1 className="type-screen-title pointer-events-none absolute inset-x-14 text-center">Bank Transfer</h1>
      </header>

      <ProgressHeader step={step} />

      <main className="min-h-0 flex-1 overflow-y-auto px-page pb-8 pt-5">
        {step === "recipient" ? (
          <RecipientStep
            recipient={recipient}
            errors={recipientErrors}
            onChange={updateRecipient}
            onContinue={continueRecipient}
          />
        ) : null}
        {step === "amount" ? (
          <AmountStep
            recipient={recipient}
            amount={amount}
            note={note}
            availableBalance={availableBalance}
            error={amountError}
            onAmountChange={(value) => {
              setAmount(value);
              setAmountError(null);
            }}
            onNoteChange={setNote}
            onContinue={continueAmount}
          />
        ) : null}
        {step === "review" ? (
          <ReviewStep
            recipient={recipient}
            amount={Number(amount)}
            note={note}
            availableBalance={availableBalance}
            onConfirm={confirmTransfer}
          />
        ) : null}
      </main>
    </AppShell>
  );
}

function ProgressHeader({ step }: { step: Exclude<TransferStep, "success"> }) {
  const index = { recipient: 1, amount: 2, review: 3 }[step];
  return (
    <div className="shrink-0 px-page">
      <div className="flex items-center gap-2" aria-label={`Step ${index} of 3`}>
        {[1, 2, 3].map((item) => (
          <span key={item} className={`h-1.5 flex-1 rounded-pill ${item <= index ? "bg-pine-primary" : "bg-border-muted"}`} />
        ))}
      </div>
      <p className="mt-2 text-caption font-bold text-ink-secondary">Step {index} of 3</p>
    </div>
  );
}

function RecipientStep({
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
      <p className="mt-1 type-body-secondary">Enter the bank details exactly as they appear on the account.</p>
      <div className="mt-5 flex flex-col gap-4">
        <Field label="Account holder name" id="account-holder" value={recipient.accountHolder} error={errors.accountHolder} autoComplete="name" onChange={(value) => onChange("accountHolder", value)} />
        <Field label="Account number" id="account-number" value={recipient.accountNumber} error={errors.accountNumber} inputMode="numeric" autoComplete="off" onChange={(value) => onChange("accountNumber", digitsOnly(value))} />
        <Field label="Re-enter account number" id="confirm-account-number" value={recipient.confirmAccountNumber} error={errors.confirmAccountNumber} inputMode="numeric" autoComplete="off" onChange={(value) => onChange("confirmAccountNumber", digitsOnly(value))} />
        <Field label="IFSC code" id="ifsc" value={recipient.ifsc} error={errors.ifsc} autoCapitalize="characters" autoComplete="off" placeholder="e.g. HDFC0001234" onChange={(value) => onChange("ifsc", normalizeIfsc(value))} />
      </div>
      <button type="button" className="btn-primary mt-6" onClick={onContinue}>Continue</button>
    </section>
  );
}

function AmountStep({
  recipient,
  amount,
  note,
  availableBalance,
  error,
  onAmountChange,
  onNoteChange,
  onContinue,
}: {
  recipient: BankRecipientDraft;
  amount: string;
  note: string;
  availableBalance: number;
  error: string | null;
  onAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onContinue: () => void;
}) {
  return (
    <section>
      <p className="type-field-label text-pine-primary">Transfer amount</p>
      <h2 className="type-section-title mt-1">Pay {recipient.accountHolder}</h2>
      <div className="mt-4 rounded-card border border-border-line bg-white p-card shadow-card">
        <p className="type-body-secondary">Available across EB+ wallets</p>
        <p className="type-amount mt-1">{formatBankTransferINR(availableBalance)}</p>
      </div>
      <div className="mt-5 flex flex-col gap-1.5">
        <label htmlFor="bank-transfer-amount" className="type-field-label">Amount</label>
        <div className="field-focus-shell flex min-h-14 items-center rounded-control border border-input-border bg-input-soft px-4">
          <span className="font-display text-title font-bold text-pine" aria-hidden="true">₹</span>
          <input id="bank-transfer-amount" type="number" inputMode="decimal" min="0" max={Math.min(100_000, availableBalance)} value={amount} onChange={(event) => onAmountChange(event.target.value)} placeholder="0" className="w-full bg-transparent px-2 font-display text-title font-bold text-pine outline-none placeholder:text-muted" />
        </div>
        {error ? <p className="text-caption text-danger">{error}</p> : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((quickAmount) => (
          <button key={quickAmount} type="button" className="min-h-11 rounded-pill border border-border-muted bg-white px-3 text-caption font-bold text-pine-primary shadow-soft" onClick={() => onAmountChange(String(quickAmount))}>+ {formatBankTransferINR(quickAmount)}</button>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-1.5">
        <label htmlFor="bank-transfer-note" className="type-field-label">Note (optional)</label>
        <input id="bank-transfer-note" type="text" maxLength={60} value={note} onChange={(event) => onNoteChange(event.target.value)} placeholder="What is this transfer for?" className="min-h-11 w-full rounded-control border border-input-border bg-input-soft px-3 py-2.5 text-body-sm font-bold text-pine outline-none placeholder:font-normal placeholder:text-placeholder" />
      </div>
      <button type="button" className="btn-primary mt-6" onClick={onContinue}>Review Transfer</button>
    </section>
  );
}

function ReviewStep({
  recipient,
  amount,
  note,
  availableBalance,
  onConfirm,
}: {
  recipient: BankRecipientDraft;
  amount: number;
  note: string;
  availableBalance: number;
  onConfirm: () => void;
}) {
  return (
    <section>
      <p className="type-field-label text-pine-primary">Review</p>
      <h2 className="type-section-title mt-1">Confirm bank transfer</h2>
      <p className="mt-1 type-body-secondary">Check the recipient and amount before you pay.</p>
      <div className="mt-5 rounded-card border border-border-line bg-white p-card shadow-card">
        <div className="flex items-center gap-3 border-b border-border-soft pb-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-surface-tint text-pine-primary" aria-hidden="true"><BankIcon /></span>
          <div className="min-w-0">
            <p className="text-body-sm font-bold text-ink">{recipient.accountHolder}</p>
            <p className="mt-0.5 text-caption text-ink-secondary">{maskAccountNumber(recipient.accountNumber)} · {recipient.ifsc}</p>
          </div>
        </div>
        <dl className="mt-2">
          <ReviewRow label="Amount" value={formatBankTransferINR(amount)} />
          <ReviewRow label="Paying from" value="EB+ available balance" />
          {note ? <ReviewRow label="Note" value={note} /> : null}
          <ReviewRow label="Balance after transfer" value={formatBankTransferINR(availableBalance - amount)} />
        </dl>
      </div>
      <div className="mt-4 flex items-start gap-3 rounded-control border border-success-border bg-success-soft p-3">
        <span className="mt-0.5 text-success" aria-hidden="true"><ShieldIcon /></span>
        <p className="text-caption text-ink-secondary">Your transfer details are protected. Bank transfers cannot be reversed after confirmation.</p>
      </div>
      <button type="button" className="btn-primary mt-6" onClick={onConfirm}>Confirm &amp; Pay {formatBankTransferINR(amount)}</button>
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
} & Pick<React.InputHTMLAttributes<HTMLInputElement>, "inputMode" | "autoComplete" | "autoCapitalize" | "placeholder">) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="type-field-label">{label}</label>
      <input id={id} type="text" value={value} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} onChange={(event) => onChange(event.target.value)} className={`min-h-11 w-full rounded-control border bg-input-soft px-3 py-2.5 text-body-sm font-bold text-pine outline-none placeholder:font-normal placeholder:text-placeholder ${error ? "border-danger" : "border-input-border"}`} {...inputProps} />
      {error ? <p id={`${id}-error`} className="text-caption text-danger">{error}</p> : null}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 border-b border-border-soft py-3 last:border-b-0"><dt className="text-body-sm text-ink-secondary">{label}</dt><dd className="max-w-[60%] text-right text-body-sm font-bold text-ink">{value}</dd></div>;
}

function ReceiptRow({ label, value, success = false, last = false }: { label: string; value: string; success?: boolean; last?: boolean }) {
  return <div className={`flex items-start justify-between gap-4 py-3 ${last ? "" : "border-b border-border-soft"}`}><span className="text-body-sm text-ink-secondary">{label}</span><strong className={`max-w-[62%] text-right text-body-sm ${success ? "text-success" : "text-ink"}`}>{value}</strong></div>;
}

function BankIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-5 9 5" /><path d="M5 10h14M6 10v7m4-7v7m4-7v7m4-7v7M4 17h16M3 20h18" /></svg>;
}

function CheckIcon() {
  return <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 13 4 4L19 7" /></svg>;
}

function ShieldIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 20 6v5c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
}
