"use client";

import { useState } from "react";
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

  if (payload.dlError) {
    return (
      <div className="w-full max-w-card rounded-bubble rounded-tl border border-border-line bg-white p-card">
        <p className="type-body">{payload.dlError}</p>
      </div>
    );
  }

  const confidence =
    typeof payload.dlConfidence === "number"
      ? Math.round(payload.dlConfidence)
      : null;

  return (
    <div className="flex w-full max-w-card flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-bubble rounded-tl border border-border-line bg-white p-card">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-body font-bold text-pine">
            Driving licence details
          </h3>
          <p className="type-body-secondary">
            {confidence !== null ? `Confidence ${confidence}%` : "Review DL number"}
          </p>
        </div>

        {payload.dlWarning ? (
          <p className="rounded-control bg-warning-tint px-3 py-2 text-caption text-warning-ink">
            {payload.dlWarning}
          </p>
        ) : null}

        <div className="flex flex-col gap-1 rounded-control border border-border-soft bg-white p-3">
          <span className="type-field-label">DL number</span>
          <input
            value={dlNumber}
            onChange={(event) => setDlNumber(event.target.value)}
            disabled={disabled}
            placeholder="e.g. MH01 20110012345"
            className="w-full border-b border-input-border bg-transparent text-body-sm font-bold text-pine outline-none disabled:opacity-50"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={disabled || !dlNumber.trim()}
        onClick={() =>
          onConfirm({ ...payload, dlNumber: dlNumber.trim(), dlError: undefined })
        }
        className="rounded-pill bg-pine-primary px-4 py-2.5 text-body-sm font-bold text-white disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}
