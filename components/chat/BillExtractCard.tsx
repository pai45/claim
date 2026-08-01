"use client";

import { useEffect, useState } from "react";
import { CLAIM_CATEGORIES } from "@/features/chat/constants";
import type { BillExtract } from "@/features/chat/types";

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
    category: extract.category || CLAIM_CATEGORIES[0],
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
        stroke="#0F3F37"
        strokeWidth="1.6"
      />
      <path d="M2 9h16" stroke="#0F3F37" strokeWidth="1.6" />
      <path
        d="M5 13h4"
        stroke="#0F3F37"
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
    <div className="flex flex-1 flex-col gap-1 rounded-xl border border-[#EDF2EE] bg-white p-3">
      <span className="font-sans text-[10px] font-bold uppercase text-[#768783]">
        {label}
      </span>
      {editing ? (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full border-b border-input-border bg-transparent font-sans text-sm font-bold text-pine outline-none"
        />
      ) : (
        <span className="truncate font-sans text-sm font-bold text-pine">
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
  const [fields, setFields] = useState<EditableFields>(() => toFields(extract));
  const [editing, setEditing] = useState(false);
  const [changingCategory, setChangingCategory] = useState(false);

  useEffect(() => {
    setFields(toFields(extract));
  }, [extract]);

  if (extract.error) {
    return (
      <div className="w-full max-w-[340px] rounded-[18px] rounded-tl border border-[#E6ECE8] bg-white p-4">
        <p className="font-sans text-sm text-body">{extract.error}</p>
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
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSaveEdits() {
    setEditing(false);
    setChangingCategory(false);
    persist(fields);
  }

  function handleCategoryPick(category: string) {
    const next = { ...fields, category };
    setFields(next);
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
    <div className="flex w-full max-w-[340px] flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-[18px] rounded-tl border border-[#E6ECE8] bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9F6F2]">
            <CreditCardIcon />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h3 className="font-sans text-base font-bold text-pine">
              Claim details extracted
            </h3>
            <p className="font-sans text-xs font-medium text-[#768783]">
              {confidence !== null ? `Confidence ${confidence}%` : "Confidence —"}
            </p>
          </div>
        </div>

        {extract.warning ? (
          <p className="rounded-lg bg-[#FFF8E8] px-3 py-2 font-sans text-xs font-medium text-[#7A5A00]">
            {extract.warning}
          </p>
        ) : null}

        <div className="flex flex-col gap-2.5">
          <div className="flex gap-2.5">
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
          <div className="flex gap-2.5">
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
          <div className="flex gap-2.5">
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
                className={`rounded-full border px-3 py-1.5 font-sans text-xs font-bold ${
                  fields.category === category
                    ? "border-pine-primary bg-[#E9F6F2] text-pine"
                    : "border-[#DCE7E3] bg-white text-pine"
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
            className="mt-1 w-full rounded-full bg-pine-primary px-4 py-2.5 font-sans text-sm font-bold text-white"
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
          className="rounded-full border border-[#DCE7E3] bg-white px-4 py-2.5 font-sans text-sm font-bold text-pine disabled:opacity-50"
        >
          {extract.submitted ? "Submitted" : "Submit claim"}
        </button>
        <button
          type="button"
          disabled={extract.submitted}
          onClick={() => {
            setChangingCategory(false);
            setEditing((prev) => !prev);
          }}
          className="rounded-full border border-[#DCE7E3] bg-white px-4 py-2.5 font-sans text-sm font-bold text-pine disabled:opacity-50"
        >
          {editing ? "Cancel edit" : "Edit details"}
        </button>
        <button
          type="button"
          disabled={extract.submitted}
          onClick={() => {
            setEditing(false);
            setChangingCategory((prev) => !prev);
          }}
          className="rounded-full border border-[#DCE7E3] bg-white px-4 py-2.5 font-sans text-sm font-bold text-pine disabled:opacity-50"
        >
          Change category
        </button>
      </div>
    </div>
  );
}
