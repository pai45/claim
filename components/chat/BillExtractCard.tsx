"use client";

import { useState } from "react";
import { CLAIM_CATEGORIES } from "@/features/chat/constants";
import type { BillExtract } from "@/features/chat/types";
import { colors } from "@/lib/ui/colors";

type BillExtractCardProps = {
  messageId: string;
  extract: BillExtract;
  onUpdate?: (messageId: string, next: BillExtract) => void;
  onSubmitted?: (messageId: string, extract: BillExtract) => void;
};

type EditableFields = {
  category: string;
  vendor: string;
  amount: string;
  billDate: string;
  billingMonth: string;
  invoiceNo: string;
};

function toFields(extract: BillExtract): EditableFields {
  return {
    // Keep OCR category; never force "Professional Development"
    category: extract.category || "Other",
    vendor: extract.vendor || extract.merchant || "",
    amount: extract.amount || "",
    billDate: extract.billDate || extract.date || "",
    billingMonth: extract.billingMonth || "",
    invoiceNo: extract.invoiceNo || "",
  };
}

function CreditCardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect
        x="2"
        y="5"
        width="16"
        height="11"
        rx="2"
        stroke={colors.pine}
        strokeWidth="1.6"
      />
      <path d="M2 9h16" stroke={colors.pine} strokeWidth="1.6" />
      <path
        d="M5 13h4"
        stroke={colors.pine}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FieldBox({
  label,
  value,
  editing,
  onChange,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-control border border-border-soft bg-white p-3">
      <span className="type-field-label">{label}</span>
      {editing ? (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full border-b border-input-border bg-transparent text-body-sm font-bold text-pine outline-none"
        />
      ) : (
        <span className="truncate text-body-sm font-bold text-pine">
          {value || "—"}
        </span>
      )}
    </div>
  );
}

export function BillExtractCard({
  messageId,
  extract,
  onUpdate,
  onSubmitted,
}: BillExtractCardProps) {
  const [draftFields, setDraftFields] = useState<EditableFields | null>(null);
  const [editing, setEditing] = useState(false);
  const [changingCategory, setChangingCategory] = useState(false);
  const fields = draftFields ?? toFields(extract);

  if (extract.error) {
    return (
      <div className="w-full max-w-card rounded-bubble rounded-tl border border-border-line bg-white p-card">
        <p className="type-body">{extract.error}</p>
      </div>
    );
  }

  function persist(next: EditableFields, extras?: Partial<BillExtract>) {
    onUpdate?.(messageId, {
      ...extract,
      ...next,
      ...extras,
    });
  }

  function updateField<K extends keyof EditableFields>(
    key: K,
    value: EditableFields[K],
  ) {
    setDraftFields((prev) => ({
      ...(prev ?? toFields(extract)),
      [key]: value,
    }));
  }

  function handleSaveEdits() {
    setEditing(false);
    setChangingCategory(false);
    persist(fields);
    setDraftFields(null);
  }

  function handleCategoryPick(category: string) {
    const next = { ...fields, category };
    setDraftFields(next);
    setChangingCategory(false);
    persist(next);
  }

  function handleSubmit() {
    if (extract.submitted) return;
    const nextExtract = { ...extract, ...fields, submitted: true };
    persist(fields, { submitted: true });
    onSubmitted?.(messageId, nextExtract);
  }

  const confidence =
    typeof extract.confidence === "number"
      ? Math.round(extract.confidence)
      : null;

  return (
    <div className="flex w-full max-w-card flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-bubble rounded-tl border border-border-line bg-white p-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-control bg-surface-tint-strong">
            <CreditCardIcon />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h3 className="text-body font-bold text-pine">
              Claim details extracted
            </h3>
            <p className="type-body-secondary">
              {confidence !== null ? `Confidence ${confidence}%` : "Confidence —"}
            </p>
          </div>
        </div>

        {extract.warning ? (
          <p className="rounded-control bg-warning-tint px-3 py-2 text-caption text-warning-ink">
            {extract.warning}
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <FieldBox
              label="Category"
              value={fields.category}
              editing={editing}
              onChange={(value) => updateField("category", value)}
            />
            <FieldBox
              label="Vendor"
              value={fields.vendor}
              editing={editing}
              onChange={(value) => updateField("vendor", value)}
            />
          </div>
          <div className="flex gap-3">
            <FieldBox
              label="Amount"
              value={fields.amount}
              editing={editing}
              onChange={(value) => updateField("amount", value)}
            />
            <FieldBox
              label="Bill Date"
              value={fields.billDate}
              editing={editing}
              onChange={(value) => updateField("billDate", value)}
            />
          </div>
          <div className="flex gap-3">
            <FieldBox
              label="Billing Month"
              value={fields.billingMonth}
              editing={editing}
              onChange={(value) => updateField("billingMonth", value)}
            />
            <FieldBox
              label="Invoice No"
              value={fields.invoiceNo}
              editing={editing}
              onChange={(value) => updateField("invoiceNo", value)}
            />
          </div>
        </div>

        {changingCategory ? (
          <div className="mt-1 flex flex-wrap gap-2">
            {CLAIM_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryPick(category)}
                className={`rounded-pill border px-3 py-1.5 text-caption font-bold ${
                  fields.category === category
                    ? "border-pine-primary bg-surface-tint-strong text-pine"
                    : "border-input-border bg-white text-pine"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        ) : null}

        {editing ? (
          <button
            type="button"
            onClick={handleSaveEdits}
            className="mt-1 w-full rounded-pill bg-pine-primary px-4 py-2.5 text-body-sm font-bold text-white"
          >
            Save details
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap content-start gap-2">
        <button
          type="button"
          disabled={extract.submitted}
          onClick={handleSubmit}
          className="rounded-pill border border-input-border bg-white px-4 py-2.5 text-body-sm font-bold text-pine disabled:opacity-50"
        >
          {extract.submitted ? "Submitted" : "Submit claim"}
        </button>
        <button
          type="button"
          disabled={extract.submitted}
          onClick={() => {
            setChangingCategory(false);
            setDraftFields(null);
            setEditing((prev) => !prev);
          }}
          className="rounded-pill border border-input-border bg-white px-4 py-2.5 text-body-sm font-bold text-pine disabled:opacity-50"
        >
          {editing ? "Cancel edit" : "Edit details"}
        </button>
        <button
          type="button"
          disabled={extract.submitted}
          onClick={() => {
            setEditing(false);
            setDraftFields(null);
            setChangingCategory((prev) => !prev);
          }}
          className="rounded-pill border border-input-border bg-white px-4 py-2.5 text-body-sm font-bold text-pine disabled:opacity-50"
        >
          Change category
        </button>
      </div>
    </div>
  );
}
