"use client";

import { useMemo, useState } from "react";
import { CLAIM_CATEGORIES } from "@/features/chat/constants";
import type {
  BillExtract,
  ClaimFieldName,
  ClaimFieldReviewState,
} from "@/features/chat/types";
import {
  claimFieldReviewState,
  evaluateClaimPrecheck,
  parseClaimAmount,
} from "@/lib/claims/precheck";
import { formatINR } from "@/features/dashboard/constants";
import { PrivacyNotice } from "./PrivacyNotice";

type BillExtractCardProps = {
  messageId: string;
  extract: BillExtract;
  onUpdate?: (messageId: string, next: BillExtract) => void;
  onSubmitted?: (messageId: string, extract: BillExtract) => void;
  onReplace?: (messageId: string) => void;
};

type EditableFields = {
  category: string;
  vendor: string;
  amount: string;
  billDate: string;
  billingMonth: string;
  invoiceNo: string;
};

function toDateInput(value?: string): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function toMonthInput(value?: string): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}$/.test(value)) return value;
  const parsed = new Date(`1 ${value}`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 7);
}

function toFields(extract: BillExtract): EditableFields {
  return {
    category: extract.category ?? "",
    vendor: extract.vendor || extract.merchant || "",
    amount: extract.amount ?? "",
    billDate: toDateInput(extract.billDate || extract.date),
    billingMonth: toMonthInput(extract.billingMonth),
    invoiceNo: extract.invoiceNo ?? "",
  };
}

function FieldStatus({ state }: { state: ClaimFieldReviewState }) {
  if (state === "confirmed") {
    return (
      <span className="shrink-0 text-success" aria-label="Confirmed">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.5 7.25 5.5 10.25 11.5 3.75"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  return (
    <span
      className={`shrink-0 text-right text-caption ${
        state === "missing" ? "text-danger" : "text-warning"
      }`}
    >
      {state === "missing" ? "Missing" : "Review recommended"}
    </span>
  );
}

function Field({
  label,
  name,
  state,
  children,
}: {
  label: string;
  name: ClaimFieldName;
  state: ClaimFieldReviewState;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1" htmlFor={`claim-${name}`}>
      <span className="flex items-center justify-between gap-1">
        <span className="type-field-label truncate">{label}</span>
        <FieldStatus state={state} />
      </span>
      {children}
    </label>
  );
}

export function BillExtractCard({
  messageId,
  extract,
  onUpdate,
  onSubmitted,
  onReplace,
}: BillExtractCardProps) {
  const [fields, setFields] = useState<EditableFields>(() => toFields(extract));
  const [manualMode, setManualMode] = useState(false);
  const [acknowledged, setAcknowledged] = useState(
    Boolean(extract.warningAcknowledged),
  );

  const workingExtract = useMemo<BillExtract>(
    () => ({
      ...extract,
      ...fields,
      error: manualMode ? undefined : extract.error,
      warningAcknowledged: acknowledged,
    }),
    [acknowledged, extract, fields, manualMode],
  );
  const precheck = useMemo(
    () => evaluateClaimPrecheck(workingExtract),
    [workingExtract],
  );

  function updateField(key: keyof EditableFields, value: string) {
    const next = { ...fields, [key]: value };
    setFields(next);
    onUpdate?.(messageId, {
      ...extract,
      ...next,
      error: manualMode ? undefined : extract.error,
      warningAcknowledged: acknowledged,
    });
  }

  function fieldState(field: ClaimFieldName) {
    return claimFieldReviewState(field, workingExtract);
  }

  function handleSubmit() {
    if (
      extract.submitted ||
      precheck.status === "blocked" ||
      (precheck.requiresAcknowledgement && !acknowledged)
    ) {
      return;
    }
    onUpdate?.(messageId, workingExtract);
    onSubmitted?.(messageId, workingExtract);
  }

  const amount = parseClaimAmount(fields.amount);
  const inputClass =
    "min-h-11 w-full rounded-control border border-input-border bg-input-soft px-3 py-2.5 text-body-sm font-bold text-pine outline-none focus:border-pine disabled:opacity-50";
  const secondaryActionClass =
    "inline-flex min-h-11 items-center rounded-pill border border-input-border bg-white px-4 py-2.5 text-body-sm font-bold text-pine";

  if (extract.error && !manualMode) {
    return (
      <div className="flex w-full max-w-card flex-col gap-3 rounded-bubble rounded-tl border border-border-line bg-white p-card">
        <div role="alert" className="rounded-control bg-danger-soft px-3 py-2 text-body-sm text-danger">
          {extract.error}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setManualMode(true)}
            className="min-h-11 rounded-control bg-pine-primary px-4 py-2.5 text-body-sm font-bold text-white"
          >
            Enter details manually
          </button>
          <button
            type="button"
            onClick={() => onReplace?.(messageId)}
            className={secondaryActionClass}
          >
            Replace bill
          </button>
        </div>
        <PrivacyNotice compact />
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-card flex-col gap-3">
      <div className="flex flex-col gap-4 rounded-bubble rounded-tl border border-border-line bg-white p-card">
        <div>
          <h3 className="text-body font-bold text-pine">Review claim details</h3>
          <p className="type-body-secondary">
            Check fields marked for review. Demo policy checks update as you edit.
          </p>
        </div>

        {extract.warning ? (
          <p className="rounded-control bg-warning-tint px-3 py-2 text-caption text-warning-ink">
            {extract.warning}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-y-3">
          <Field label="Category" name="category" state={fieldState("category")}>
            <select
              id="claim-category"
              value={fields.category}
              onChange={(event) => updateField("category", event.target.value)}
              className={inputClass}
            >
              <option value="">Select benefit category</option>
              {CLAIM_CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </Field>
          <Field label="Vendor" name="vendor" state={fieldState("vendor")}>
            <input id="claim-vendor" value={fields.vendor} onChange={(event) => updateField("vendor", event.target.value)} className={inputClass} />
          </Field>
          <Field label="Amount" name="amount" state={fieldState("amount")}>
            <div className="flex min-h-11 items-center rounded-control border border-input-border bg-input-soft px-3 focus-within:border-pine">
              <span aria-hidden className="text-body-sm font-bold text-pine">₹</span>
              <input id="claim-amount" inputMode="decimal" value={fields.amount.replace(/[^\d.,]/g, "")} onChange={(event) => updateField("amount", event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-body-sm font-bold text-pine outline-none" />
            </div>
          </Field>
          <Field label="Bill date" name="billDate" state={fieldState("billDate")}>
            <input id="claim-billDate" type="date" value={fields.billDate} onChange={(event) => updateField("billDate", event.target.value)} className={inputClass} />
          </Field>
          <Field label="Billing month" name="billingMonth" state={fieldState("billingMonth")}>
            <input id="claim-billingMonth" type="month" value={fields.billingMonth} onChange={(event) => updateField("billingMonth", event.target.value)} className={inputClass} />
          </Field>
          <Field label="Invoice number" name="invoiceNo" state={fieldState("invoiceNo")}>
            <input id="claim-invoiceNo" value={fields.invoiceNo} onChange={(event) => updateField("invoiceNo", event.target.value)} className={inputClass} />
          </Field>
        </div>

        <section aria-live="polite" className="rounded-control border border-border-line bg-surface p-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-body-sm font-bold text-pine">Demo claim check</h4>
            <span className="rounded-pill bg-white px-2 py-1 text-caption font-bold text-ink-secondary">
              {precheck.status === "blocked" ? "Action needed" : precheck.status === "warning" ? "Review" : "Ready"}
            </span>
          </div>
          <ul className="mt-2 flex flex-col gap-2">
            {precheck.checks.map((check) => (
              <li key={check.id} className="flex items-start gap-2 text-caption leading-4">
                <span aria-hidden className={check.status === "pass" ? "text-success" : check.status === "warning" ? "text-warning" : "text-danger"}>
                  {check.status === "pass" ? "✓" : check.status === "warning" ? "!" : "×"}
                </span>
                <span><strong>{check.label}:</strong> {check.detail}</span>
              </li>
            ))}
          </ul>
        </section>

        {precheck.requiresAcknowledgement ? (
          <label className="flex items-start gap-2 text-caption leading-4 text-ink-secondary">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(event) => {
                setAcknowledged(event.target.checked);
                onUpdate?.(messageId, { ...workingExtract, warningAcknowledged: event.target.checked });
              }}
              className="mt-0.5 h-4 w-4"
            />
            I reviewed the warnings and want to submit this demo claim.
          </label>
        ) : null}

        <PrivacyNotice compact />
      </div>

      <button
        type="button"
        disabled={extract.submitted || precheck.status === "blocked" || (precheck.requiresAcknowledgement && !acknowledged)}
        onClick={handleSubmit}
        className="min-h-14 w-full rounded-control bg-pine-primary px-4 py-3 text-body font-bold text-white disabled:opacity-50"
      >
        {extract.submitted ? "Submitted" : `Submit ${amount ? formatINR(amount) : ""} claim`.replace("  ", " ")}
      </button>

      <div className="flex flex-wrap gap-2">
        {extract.previewUrl ? (
          <a
            href={extract.previewUrl}
            target="_blank"
            rel="noreferrer"
            className={secondaryActionClass}
          >
            View original
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => onReplace?.(messageId)}
          className={secondaryActionClass}
        >
          Replace bill
        </button>
      </div>
    </div>
  );
}
