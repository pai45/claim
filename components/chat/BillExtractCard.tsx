"use client";

/* eslint-disable @next/next/no-img-element -- previews are transient blob/data URLs */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CLAIM_CATEGORIES } from "@/features/chat/constants";
import type { BillExtract } from "@/features/chat/types";
import {
  evaluateClaimPrecheck,
  parseClaimAmount,
} from "@/lib/claims/precheck";
import { formatINR } from "@/features/dashboard/constants";

type BillExtractCardProps = {
  messageId: string;
  extract: BillExtract;
  onUpdate?: (messageId: string, next: BillExtract) => void;
  onSubmitted?: (messageId: string, extract: BillExtract) => void;
  onReplace?: (messageId: string) => void;
  onSaveClaimEdit?: (
    messageId: string,
    claimId: string,
    extract: BillExtract,
  ) => void;
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

function formatDate(value: string) {
  if (!value) return "—";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMonth(value: string) {
  if (!value) return "—";
  const parsed = new Date(`${value}-01T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return replacements[character];
  });
}

function demoBillPreview(fields: EditableFields, claimId: string): string {
  const vendor = escapeXml(fields.vendor || "Merchant");
  const category = escapeXml(fields.category || "Employee benefit");
  const amount = escapeXml(fields.amount || "—");
  const date = escapeXml(formatDate(fields.billDate));
  const invoice = escapeXml(fields.invoiceNo || claimId);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="420" viewBox="0 0 720 420"><rect width="720" height="420" rx="24" fill="#fff"/><rect x="24" y="24" width="672" height="372" rx="16" fill="#f8fbf9" stroke="#dfe8e1" stroke-width="2"/><text x="58" y="78" font-family="Arial,sans-serif" font-size="28" font-weight="700" fill="#123f36">${vendor}</text><text x="58" y="111" font-family="Arial,sans-serif" font-size="16" fill="#60756e">${category}</text><line x1="58" y1="142" x2="662" y2="142" stroke="#dfe8e1" stroke-width="2"/><text x="58" y="190" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="#7d8b87">BILL DATE</text><text x="58" y="220" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="#123f36">${date}</text><text x="390" y="190" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="#7d8b87">INVOICE NO.</text><text x="390" y="220" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="#123f36">${invoice}</text><rect x="58" y="274" width="604" height="76" rx="12" fill="#e9faf1"/><text x="82" y="305" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="#60756e">TOTAL</text><text x="82" y="337" font-family="Arial,sans-serif" font-size="28" font-weight="700" fill="#17664f">INR ${amount}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function CardIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" aria-hidden>
      <rect x="3.25" y="5" width="14.5" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 8.2h13" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function DetailTile({ label, value, children }: { label: string; value?: string; children?: ReactNode }) {
  return (
    <div className="field-focus-shell min-w-0 rounded-xl border border-[#e6ece8] bg-white/70 px-3 py-2.5">
      <span className="block text-[9px] font-bold uppercase tracking-[0.025em] text-[#7d8b87]">
        {label}
      </span>
      {children ?? (
        <strong className="mt-1 block truncate text-[12px] leading-4 text-[#123f36]" title={value}>
          {value || "—"}
        </strong>
      )}
    </div>
  );
}

const editorClass =
  "mt-1 min-h-7 w-full min-w-0 bg-transparent text-[12px] font-bold leading-4 text-[#123f36] outline-none";
const actionClass =
  "inline-flex min-h-10 flex-1 items-center justify-center whitespace-nowrap rounded-full border border-[#d7e3dc] bg-white/90 px-3 py-2 text-[12px] font-bold text-[#174b40] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-45";

export function BillExtractCard({
  messageId,
  extract,
  onUpdate,
  onSubmitted,
  onReplace,
  onSaveClaimEdit,
}: BillExtractCardProps) {
  const [fields, setFields] = useState<EditableFields>(() => toFields(extract));
  const [editing, setEditing] = useState(Boolean(extract.editClaimId));
  const [acknowledged, setAcknowledged] = useState(Boolean(extract.warningAcknowledged));
  const categoryRef = useRef<HTMLSelectElement>(null);
  const isClaimEdit = Boolean(extract.editClaimId);

  useEffect(() => {
    if (!editing) return;
    const frame = window.requestAnimationFrame(() => categoryRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [editing]);

  const workingExtract = useMemo<BillExtract>(
    () => ({
      ...extract,
      ...fields,
      error: editing ? undefined : extract.error,
      warningAcknowledged: acknowledged,
    }),
    [acknowledged, editing, extract, fields],
  );
  const precheck = useMemo(() => evaluateClaimPrecheck(workingExtract), [workingExtract]);
  const amount = parseClaimAmount(fields.amount);
  const previewUrl =
    extract.previewUrl ||
    (extract.editClaimId
      ? demoBillPreview(fields, extract.editClaimId)
      : undefined);
  const submitDisabled =
    Boolean(extract.submitted) ||
    precheck.status === "blocked" ||
    (precheck.requiresAcknowledgement && !acknowledged);

  function updateField(key: keyof EditableFields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function saveEdits() {
    onUpdate?.(messageId, workingExtract);
    setEditing(false);
    if (extract.editClaimId) {
      onSaveClaimEdit?.(messageId, extract.editClaimId, workingExtract);
    }
  }

  function cancelEdits() {
    setFields(toFields(extract));
    setEditing(false);
  }

  function editCategory() {
    setEditing(true);
    window.requestAnimationFrame(() => categoryRef.current?.focus());
  }

  function handleSubmit() {
    if (submitDisabled) return;
    onUpdate?.(messageId, workingExtract);
    onSubmitted?.(messageId, workingExtract);
  }

  if (extract.error && !editing) {
    return (
      <div className="w-full rounded-[18px] border border-[#ead9d5] bg-white/95 p-4">
        <p role="alert" className="text-body-sm text-danger">{extract.error}</p>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => setEditing(true)} className={actionClass}>Enter details</button>
          <button type="button" onClick={() => onReplace?.(messageId)} className={actionClass}>Replace bill</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <article className="rounded-[18px] border border-[#dfe8e1] bg-white/95 p-4 shadow-[0_8px_26px_rgba(24,70,47,0.04)]">
        <header className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e9faf1] text-[#174b40]">
            <CardIcon />
          </span>
          <div className="min-w-0">
            <h3 className="text-body-sm font-bold text-pine">Claim details extracted</h3>
            <p className="truncate text-[11px] leading-4 text-[#82908b]">{fields.vendor || "Review the scanned details"}</p>
          </div>
        </header>

        {previewUrl ? (
          <figure className="mt-3.5 overflow-hidden rounded-xl border border-[#dfe8e1] bg-[#f8fbf9]">
            {extract.previewUrl && extract.previewType === "application/pdf" ? (
              <div className="flex min-h-28 flex-col items-center justify-center gap-1 px-3 py-5 text-center">
                <CardIcon />
                <strong className="max-w-full truncate text-[12px] text-[#123f36]">{extract.fileName}</strong>
                <span className="text-[10px] text-[#7d8b87]">PDF bill attached</span>
              </div>
            ) : (
              /* Blob previews are transient; seeded claims recreate this SVG locally. */
              <img src={previewUrl} alt={`Bill preview for ${fields.vendor || "claim"}`} className="aspect-[12/7] w-full object-cover" />
            )}
            <figcaption className="truncate border-t border-[#dfe8e1] bg-white px-3 py-2 text-[10px] text-[#60756e]">
              {extract.fileName}
            </figcaption>
          </figure>
        ) : null}

        <div className="mt-3.5 grid grid-cols-2 gap-2">
          <DetailTile label="Category" value={fields.category}>
            {editing ? (
              <select ref={categoryRef} value={fields.category} onChange={(event) => updateField("category", event.target.value)} className={editorClass} aria-label="Category">
                <option value="">Select category</option>
                {CLAIM_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            ) : undefined}
          </DetailTile>
          <DetailTile label="Vendor" value={fields.vendor}>
            {editing ? <input value={fields.vendor} onChange={(event) => updateField("vendor", event.target.value)} className={editorClass} aria-label="Vendor" /> : undefined}
          </DetailTile>
          <DetailTile label="Amount" value={amount ? formatINR(amount) : fields.amount}>
            {editing ? <input inputMode="decimal" value={fields.amount.replace(/[^\d.,]/g, "")} onChange={(event) => updateField("amount", event.target.value)} className={editorClass} aria-label="Amount" /> : undefined}
          </DetailTile>
          <DetailTile label="Bill date" value={formatDate(fields.billDate)}>
            {editing ? <input type="date" value={fields.billDate} onChange={(event) => updateField("billDate", event.target.value)} className={editorClass} aria-label="Bill date" /> : undefined}
          </DetailTile>
          <DetailTile label="Billing month" value={formatMonth(fields.billingMonth)}>
            {editing ? <input type="month" value={fields.billingMonth} onChange={(event) => updateField("billingMonth", event.target.value)} className={editorClass} aria-label="Billing month" /> : undefined}
          </DetailTile>
          <DetailTile label="Invoice no" value={fields.invoiceNo}>
            {editing ? <input value={fields.invoiceNo} onChange={(event) => updateField("invoiceNo", event.target.value)} className={editorClass} aria-label="Invoice number" /> : undefined}
          </DetailTile>
        </div>

        {extract.warning ? (
          <p className="mt-3 rounded-xl bg-warning-tint px-3 py-2 text-[11px] leading-4 text-warning-ink">{extract.warning}</p>
        ) : null}
        {precheck.status === "blocked" ? (
          <p className="mt-3 rounded-xl bg-danger-soft px-3 py-2 text-[11px] leading-4 text-danger">Some required details need attention before this claim can be submitted.</p>
        ) : null}
        {precheck.requiresAcknowledgement ? (
          <label className="mt-3 flex items-start gap-2 text-[11px] leading-4 text-[#60756e]">
            <input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#17664f]" />
            I reviewed the flagged details and confirm they are correct.
          </label>
        ) : null}
      </article>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        {editing ? (
          <>
            <button type="button" disabled={submitDisabled} onClick={saveEdits} className={actionClass}>{isClaimEdit ? "Save changes" : "Save details"}</button>
            <button type="button" onClick={cancelEdits} className={actionClass}>Cancel</button>
            <button type="button" onClick={() => onReplace?.(messageId)} className={actionClass}>Replace bill</button>
          </>
        ) : (
          <>
            {isClaimEdit ? null : (
              <button type="button" disabled={submitDisabled} onClick={handleSubmit} className={actionClass}>{extract.submitted ? "Submitted" : "Submit claim"}</button>
            )}
            <button type="button" onClick={() => setEditing(true)} className={actionClass}>Edit details</button>
            <button type="button" onClick={editCategory} className={actionClass}>Change category</button>
          </>
        )}
      </div>
    </div>
  );
}
