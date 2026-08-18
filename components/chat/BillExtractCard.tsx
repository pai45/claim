"use client";

/* eslint-disable @next/next/no-img-element -- previews can be transient blob/data URLs */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { AppIcon } from "@/components/shared/AppIcon";
import { RegistrationDeclaration } from "@/components/chat/RegistrationDeclaration";
import { CLAIM_CATEGORIES } from "@/features/chat/constants";
import { getDemoPrecheckDate } from "@/features/chat/demoUploadScenarios";
import {
  billDraftFingerprint,
  isBillDraftEligible,
  type BillDraftOperationResult,
} from "@/features/chat/drafts";
import type { BillExtract } from "@/features/chat/types";
import { formatINR } from "@/features/dashboard/constants";
import {
  evaluateClaimPrecheck,
  parseClaimAmount,
} from "@/lib/claims/precheck";
import { useModalFocus } from "@/lib/ui/useModalFocus";

type BillExtractCardProps = {
  messageId: string;
  extract: BillExtract;
  onUpdate?: (messageId: string, next: BillExtract) => void;
  onSubmitted?: (messageId: string, extract: BillExtract) => void;
  onReplace?: (messageId: string) => void;
  onNewClaim?: () => void;
  onSaveDraft?: (
    messageId: string,
    extract: BillExtract,
  ) => Promise<BillDraftOperationResult>;
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
    amount: sanitizeAmountInput(extract.amount ?? ""),
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
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="420" viewBox="0 0 720 420"><rect width="720" height="420" rx="24" fill="#fff"/><rect x="24" y="24" width="672" height="372" rx="16" fill="#f8fbf9" stroke="#dfe8e1" stroke-width="2"/><text x="58" y="78" font-family="sans-serif" font-size="28" font-weight="700" fill="#123f36">${vendor}</text><text x="58" y="111" font-family="sans-serif" font-size="16" fill="#60756e">${category}</text><line x1="58" y1="142" x2="662" y2="142" stroke="#dfe8e1" stroke-width="2"/><text x="58" y="190" font-family="sans-serif" font-size="14" font-weight="700" fill="#7d8b87">BILL DATE</text><text x="58" y="220" font-family="sans-serif" font-size="20" font-weight="700" fill="#123f36">${date}</text><text x="390" y="190" font-family="sans-serif" font-size="14" font-weight="700" fill="#7d8b87">INVOICE NO.</text><text x="390" y="220" font-family="sans-serif" font-size="20" font-weight="700" fill="#123f36">${invoice}</text><rect x="58" y="274" width="604" height="76" rx="12" fill="#e9faf1"/><text x="82" y="305" font-family="sans-serif" font-size="14" font-weight="700" fill="#60756e">TOTAL</text><text x="82" y="337" font-family="sans-serif" font-size="28" font-weight="700" fill="#17664f">INR ${amount}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function CardIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" aria-hidden>
      <rect
        x="3.25"
        y="5"
        width="14.5"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M4 8.2h13" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function DetailTile({
  label,
  value,
  issue,
  children,
}: {
  label: string;
  value?: string;
  issue?: "missing" | "review";
  children?: ReactNode;
}) {
  return (
    <div
      className={`field-focus-shell min-w-0 rounded-control border px-3 py-2.5 ${
        issue
          ? "border-warning-border bg-warning-soft"
          : "border-border-line bg-input-soft"
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="type-field-label block">{label}</span>
        {issue ? (
          <span className="shrink-0 text-caption font-bold text-warning-ink">
            {issue === "missing" ? "Missing" : "Check"}
          </span>
        ) : null}
      </div>
      {children ?? (
        <strong className="mt-1 block truncate text-body-sm font-bold text-pine" title={value}>
          {value || "—"}
        </strong>
      )}
    </div>
  );
}

const editorClass =
  "mt-1 min-h-11 w-full min-w-0 bg-transparent text-body-sm font-bold text-pine outline-none";
const actionClass =
  "inline-flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded-pill border border-border-muted bg-white px-4 py-2 text-body-sm font-bold text-pine shadow-soft transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-pine-primary disabled:cursor-not-allowed disabled:opacity-50";

function sanitizeAmountInput(value: string): string {
  const numeric = value.replace(/[^\d.]/g, "");
  const [whole = "", ...decimalParts] = numeric.split(".");
  const decimal = decimalParts.join("").slice(0, 2);

  if (decimalParts.length === 0) return whole;
  return `${whole || "0"}.${decimal}`;
}

export function BillExtractCard({
  messageId,
  extract,
  onUpdate,
  onSubmitted,
  onNewClaim,
  onSaveDraft,
  onSaveClaimEdit,
}: BillExtractCardProps) {
  const [fields, setFields] = useState<EditableFields>(() => toFields(extract));
  const [editing, setEditing] = useState(
    Boolean(extract.editClaimId || extract.manualReview),
  );
  const [acknowledged, setAcknowledged] = useState(
    Boolean(extract.warningAcknowledged),
  );
  const [declarationAccepted, setDeclarationAccepted] = useState(
    Boolean(extract.submitted),
  );
  const categoryRef = useRef<HTMLSelectElement>(null);
  const previewDialogRef = useRef<HTMLDivElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftError, setDraftError] = useState<BillDraftOperationResult | null>(
    null,
  );
  const isClaimEdit = Boolean(extract.editClaimId);

  useModalFocus(previewDialogRef, previewOpen, () => setPreviewOpen(false));

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
  const precheck = useMemo(
    () => evaluateClaimPrecheck(workingExtract, getDemoPrecheckDate(workingExtract)),
    [workingExtract],
  );
  const amount = parseClaimAmount(fields.amount);
  const legacyPreviewUrl =
    extract.previewUrl ||
    (extract.editClaimId
      ? demoBillPreview(fields, extract.editClaimId)
      : undefined);
  const submitDisabled =
    Boolean(extract.submitted) ||
    precheck.status === "blocked" ||
    (precheck.requiresAcknowledgement && !acknowledged) ||
    !declarationAccepted;
  const reviewItems = precheck.checks.filter((check) => check.status !== "pass");
  const currentDraftFingerprint = billDraftFingerprint(workingExtract);
  const draftIsCurrent = Boolean(
    extract.draftId &&
      extract.draftSavedFingerprint === currentDraftFingerprint,
  );
  const canSaveDraft = isBillDraftEligible(workingExtract) && Boolean(onSaveDraft);

  function issueFor(
    field: keyof EditableFields,
    value: string,
  ): "missing" | "review" | undefined {
    const issue = extract.reviewFields?.[field];
    return issue === "missing" && value.trim() ? undefined : issue;
  }

  const amountIssue = issueFor("amount", fields.amount);
  const billDateIssue = issueFor("billDate", fields.billDate);

  function updateField(key: keyof EditableFields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function saveEdits() {
    const savedExtract = { ...workingExtract, manualReview: false };
    onUpdate?.(messageId, savedExtract);
    setEditing(false);
    if (extract.editClaimId) {
      onSaveClaimEdit?.(messageId, extract.editClaimId, savedExtract);
    }
  }

  function cancelEdits() {
    setFields(toFields(extract));
    setEditing(false);
  }

  function handleSubmit() {
    if (submitDisabled) return;
    onUpdate?.(messageId, workingExtract);
    setEditing(false);
    onSubmitted?.(messageId, workingExtract);
  }

  async function handleSaveDraft() {
    if (!canSaveDraft || savingDraft || !onSaveDraft) return;
    const nextExtract = { ...workingExtract, manualReview: false };
    setSavingDraft(true);
    setDraftError(null);
    const result = await onSaveDraft(messageId, nextExtract);
    setSavingDraft(false);
    if (!result.ok) {
      setDraftError(result);
      return;
    }
    setEditing(false);
  }

  if (extract.error && !editing) {
    return (
      <div className="w-full rounded-card border border-border-line bg-danger-soft p-card">
        <p role="alert" className="type-body text-danger">
          {extract.error}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setEditing(true)} className={actionClass}>
            Enter details
          </button>
          {canSaveDraft ? (
            <button
              type="button"
              onClick={() => void handleSaveDraft()}
              disabled={savingDraft || draftIsCurrent}
              className={actionClass}
            >
              {savingDraft
                ? "Saving…"
                : draftIsCurrent
                  ? "Draft saved"
                  : extract.draftId
                    ? "Update draft"
                    : "Draft"}
            </button>
          ) : null}
          {!isClaimEdit ? (
            <button
              type="button"
              onClick={onNewClaim}
              className={`${actionClass} w-fit justify-self-start`}
            >
              New claim
            </button>
          ) : null}
        </div>
        {draftError && !draftError.ok ? (
          <p role="alert" className="mt-2 text-caption text-danger">
            {draftError.message}{" "}
            {draftError.code === "limit" ? (
              <Link href="/chat-drafts" className="font-bold underline">
                Manage drafts
              </Link>
            ) : null}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="w-full">
      <article className="rounded-card border border-border-line bg-white p-card shadow-card">
        <header className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface-tint text-pine-primary">
            <CardIcon />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="type-section-title text-pine">Claim details ready</h3>
              {extract.draftId ? (
                <span className="rounded-pill border border-success-border bg-success-soft px-2 py-0.5 text-caption font-bold text-success">
                  {draftIsCurrent ? "Draft saved" : "Draft changed"}
                </span>
              ) : null}
            </div>
            <p className="truncate type-body-secondary">
              Confidence score : 95%
            </p>
          </div>
        </header>

        {extract.previewAsset || legacyPreviewUrl ? (
          <figure className="mt-4 overflow-hidden rounded-card border border-border-line bg-surface">
            {extract.previewUrl && extract.previewType === "application/pdf" ? (
              <div className="flex min-h-28 flex-col items-center justify-center gap-1 px-3 py-5 text-center text-pine-primary">
                <CardIcon />
                <strong className="max-w-full truncate text-body-sm text-pine">
                  {extract.fileName}
                </strong>
                <span className="text-caption text-ink-secondary">PDF bill attached</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="group relative block h-25 w-full overflow-hidden bg-surface-tint focus-visible:outline-2 focus-visible:outline-pine-primary"
                aria-label={`Open full bill image for ${fields.vendor || "claim"}`}
              >
                {extract.previewAsset ? (
                  <AppIcon
                    src={extract.previewAsset}
                    alt=""
                    width={720}
                    height={720}
                    className="h-full w-full object-cover object-top transition-transform duration-200 motion-reduce:transition-none group-hover:scale-[1.02]"
                  />
                ) : (
                  <img
                    src={legacyPreviewUrl}
                    alt=""
                    className="h-full w-full object-cover object-top transition-transform duration-200 motion-reduce:transition-none group-hover:scale-[1.02]"
                  />
                )}
                <span className="absolute bottom-2 right-2 rounded-pill bg-white px-3 py-1.5 text-caption font-bold text-pine shadow-soft">
                  Tap to view
                </span>
              </button>
            )}
            <figcaption className="truncate border-t border-border-line bg-white px-3 py-2 text-caption text-ink-secondary">
              {extract.fileName}
            </figcaption>
          </figure>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <DetailTile label="Category" value={fields.category}>
            {editing ? (
              <select
                ref={categoryRef}
                value={fields.category}
                onChange={(event) => updateField("category", event.target.value)}
                className={editorClass}
                aria-label="Category"
              >
                <option value="">Select category</option>
                {CLAIM_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            ) : undefined}
          </DetailTile>
          <DetailTile label="Vendor" value={fields.vendor}>
            {editing ? (
              <input
                value={fields.vendor}
                onChange={(event) => updateField("vendor", event.target.value)}
                className={editorClass}
                aria-label="Vendor"
              />
            ) : undefined}
          </DetailTile>
          <DetailTile
            label="Amount"
            value={amount ? formatINR(amount) : fields.amount}
            issue={amountIssue}
          >
            {editing ? (
              <div className="mt-1 flex min-h-11 items-center gap-1 text-body-sm font-bold text-pine">
                <span aria-hidden className="shrink-0">
                  ₹
                </span>
                <input
                  inputMode="decimal"
                  value={fields.amount}
                  onChange={(event) =>
                    updateField("amount", sanitizeAmountInput(event.target.value))
                  }
                  className="min-h-11 min-w-0 flex-1 bg-transparent outline-none"
                  aria-label="Amount in rupees"
                  aria-invalid={Boolean(amountIssue)}
                  pattern="\\d+(\\.\\d{1,2})?"
                  placeholder={amountIssue === "missing" ? "Enter amount" : undefined}
                />
              </div>
            ) : undefined}
          </DetailTile>
          <DetailTile
            label="Bill date"
            value={formatDate(fields.billDate)}
            issue={billDateIssue}
          >
            {editing ? (
              <input
                type="date"
                value={fields.billDate}
                onChange={(event) => updateField("billDate", event.target.value)}
                className={editorClass}
                aria-label="Bill date"
                aria-invalid={Boolean(billDateIssue)}
              />
            ) : undefined}
          </DetailTile>
          <DetailTile label="Billing month" value={formatMonth(fields.billingMonth)}>
            {editing ? (
              <input
                type="month"
                value={fields.billingMonth}
                onChange={(event) => updateField("billingMonth", event.target.value)}
                className={editorClass}
                aria-label="Billing month"
              />
            ) : undefined}
          </DetailTile>
          <DetailTile label="Invoice no" value={fields.invoiceNo}>
            {editing ? (
              <input
                value={fields.invoiceNo}
                onChange={(event) => updateField("invoiceNo", event.target.value)}
                className={editorClass}
                aria-label="Invoice number"
              />
            ) : undefined}
          </DetailTile>
        </div>

        {extract.warning ? (
          <p className="mt-3 rounded-control bg-warning-tint px-3 py-2.5 text-body-sm text-warning-ink">
            {extract.warning}
          </p>
        ) : null}

        {reviewItems.length > 0 ? (
          <div className="mt-3 flex flex-col gap-2" aria-label="Claim checks needing attention">
            {reviewItems.map((check) => (
              <div
                key={check.id}
                className={`rounded-control px-3 py-2.5 ${
                  check.status === "blocked"
                    ? "bg-danger-soft text-danger"
                    : "bg-warning-tint text-warning-ink"
                }`}
              >
                <strong className="block text-body-sm font-bold">{check.label}</strong>
                <span className="mt-0.5 block text-caption">{check.detail}</span>
              </div>
            ))}
          </div>
        ) : null}

        {precheck.requiresAcknowledgement ? (
          <label className="mt-3 flex min-h-11 items-start gap-2 rounded-control bg-input-soft px-3 py-2.5 text-body-sm text-ink-secondary">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
              className="mt-0.5 h-5 w-5 accent-pine-primary"
            />
            I reviewed the flagged details and confirm they are correct.
          </label>
        ) : null}

        <RegistrationDeclaration
          subject="claim"
          checked={declarationAccepted}
          onChange={setDeclarationAccepted}
          disabled={Boolean(extract.submitted)}
        />
      </article>

      <div
        className={`mt-3 grid gap-2 ${
          editing && isClaimEdit ? "grid-cols-2" : "grid-cols-3"
        }`}
      >
        {editing ? (
          <>
            <button
              type="button"
              disabled={isClaimEdit ? precheck.status === "blocked" : submitDisabled}
              onClick={isClaimEdit ? saveEdits : handleSubmit}
              className={actionClass}
            >
              {isClaimEdit ? "Save changes" : "Submit"}
            </button>
            <button type="button" onClick={cancelEdits} className={actionClass}>
              Cancel
            </button>
            {canSaveDraft ? (
              <button
                type="button"
                onClick={() => void handleSaveDraft()}
                disabled={savingDraft || draftIsCurrent}
                className={actionClass}
              >
                {savingDraft
                  ? "Saving…"
                  : draftIsCurrent
                    ? "Draft saved"
                    : extract.draftId
                      ? "Update draft"
                      : "Draft"}
              </button>
            ) : null}
            {!isClaimEdit ? (
              <button
                type="button"
                onClick={onNewClaim}
                className={`${actionClass} w-fit justify-self-start`}
              >
                New claim
              </button>
            ) : null}
          </>
        ) : (
          <>
            {isClaimEdit ? null : (
              <button
                type="button"
                disabled={submitDisabled}
                onClick={handleSubmit}
                className={actionClass}
              >
                {extract.submitted ? "Submitted" : "Submit"}
              </button>
            )}
            <button type="button" onClick={() => setEditing(true)} className={actionClass}>
              Edit
            </button>
            {canSaveDraft ? (
              <button
                type="button"
                onClick={() => void handleSaveDraft()}
                disabled={savingDraft || draftIsCurrent}
                className={actionClass}
              >
                {savingDraft
                  ? "Saving…"
                  : draftIsCurrent
                    ? "Draft saved"
                    : extract.draftId
                      ? "Update draft"
                      : "Draft"}
              </button>
            ) : null}
            {!isClaimEdit ? (
              <button
                type="button"
                onClick={onNewClaim}
                className={`${actionClass} w-fit justify-self-start`}
              >
                New claim
              </button>
            ) : null}
          </>
        )}
      </div>

      {draftError && !draftError.ok ? (
        <p role="alert" className="mt-2 px-1 text-caption text-danger">
          {draftError.message}{" "}
          {draftError.code === "limit" ? (
            <Link href="/chat-drafts" className="font-bold underline">
              Manage drafts
            </Link>
          ) : null}
        </p>
      ) : null}

      <div
        ref={previewDialogRef}
        className={`fixed inset-0 z-[90] mx-auto max-w-phone ${
          previewOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!previewOpen}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close bill preview"
          onClick={() => setPreviewOpen(false)}
          className={`absolute inset-0 bg-pine-dark/60 transition-opacity duration-200 motion-reduce:transition-none ${
            previewOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <section
          role="dialog"
          aria-modal="true"
          aria-label="Full bill preview"
          className={`absolute inset-x-page top-1/2 flex max-h-[calc(100%-32px)] -translate-y-1/2 flex-col overflow-hidden rounded-card border border-border-line bg-white p-3 shadow-menu transition-all duration-200 motion-reduce:transition-none ${
            previewOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-body-sm font-bold text-pine">{extract.fileName}</p>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-pill text-ink-secondary hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-pine-primary"
              aria-label="Close bill preview"
            >
              <span aria-hidden>×</span>
            </button>
          </div>
          {extract.previewAsset ? (
            <AppIcon
              src={extract.previewAsset}
              alt={`Full bill image for ${fields.vendor || "claim"}`}
              width={720}
              height={720}
              className="min-h-0 w-full flex-1 rounded-control bg-surface-tint object-contain"
            />
          ) : legacyPreviewUrl ? (
            <img
              src={legacyPreviewUrl}
              alt={`Full bill image for ${fields.vendor || "claim"}`}
              className="min-h-0 w-full flex-1 rounded-control bg-surface-tint object-contain"
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}
