"use client";

import { useState } from "react";
import { AppIcon } from "@/components/shared/AppIcon";
import type { DriverSalaryPayload } from "@/features/chat/types";

type DriverDlExtractCardProps = {
  payload: DriverSalaryPayload;
  onConfirm: (payload: DriverSalaryPayload) => void;
  disabled?: boolean;
};

export function DriverDlExtractCard({
  payload,
  onConfirm,
  disabled,
}: DriverDlExtractCardProps) {
  const [dlNumber, setDlNumber] = useState(payload.dlNumber || "");
  const confidence =
    typeof payload.dlConfidence === "number"
      ? Math.round(payload.dlConfidence)
      : null;

  return (
    <div className="flex w-full max-w-card flex-col gap-3">
      <article className="flex flex-col gap-3 rounded-bubble rounded-tl border border-border-line bg-white p-card shadow-card">
        <div className="flex flex-col gap-0.5">
          <h3 className="type-section-title text-pine">Driving licence details</h3>
          <p className="type-body-secondary">
            {payload.dlError
              ? "This document needs attention"
              : confidence !== null
                ? `Demo confidence ${confidence}%`
                : "Review or enter the DL number"}
          </p>
        </div>

        {payload.dlPreviewAsset ? (
          <figure className="overflow-hidden rounded-card border border-border-line bg-surface">
            <AppIcon
              src={payload.dlPreviewAsset}
              alt="Fictional demo driving licence preview"
              width={720}
              height={720}
              className="aspect-square w-full object-cover"
            />
            <figcaption className="truncate border-t border-border-line bg-white px-3 py-2 text-caption text-ink-secondary">
              {payload.dlFileName || "Demo driving licence"}
            </figcaption>
          </figure>
        ) : null}

        {payload.dlError ? (
          <p role="alert" className="rounded-control bg-danger-soft px-3 py-2.5 text-body-sm text-danger">
            {payload.dlError}
          </p>
        ) : null}

        {payload.dlWarning ? (
          <p className="rounded-control bg-warning-tint px-3 py-2.5 text-body-sm text-warning-ink">
            {payload.dlWarning}
          </p>
        ) : null}

        <label className="flex flex-col gap-1.5">
          <span className="type-field-label">DL number</span>
          <input
            value={dlNumber}
            onChange={(event) => setDlNumber(event.target.value)}
            disabled={disabled}
            placeholder="e.g. MH01 20110012345"
            className="min-h-11 w-full rounded-control border border-input-border bg-input-soft px-3 py-2.5 text-body-sm font-bold text-pine outline-none transition-colors placeholder:font-normal placeholder:text-placeholder focus:border-pine disabled:opacity-50"
          />
        </label>
      </article>

      <button
        type="button"
        disabled={disabled || !dlNumber.trim()}
        onClick={() =>
          onConfirm({
            ...payload,
            dlNumber: dlNumber.trim(),
            dlError: undefined,
            dlWarning: undefined,
          })
        }
        className="btn-primary min-h-11 h-auto py-3 disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}
