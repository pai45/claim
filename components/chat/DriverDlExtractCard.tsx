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
      <div className="w-full max-w-[340px] rounded-[18px] rounded-tl border border-[#E6ECE8] bg-white p-4">
        <p className="font-sans text-sm text-body">{payload.dlError}</p>
      </div>
    );
  }

  const confidence =
    typeof payload.dlConfidence === "number"
      ? Math.round(payload.dlConfidence)
      : null;

  return (
    <div className="flex w-full max-w-[340px] flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-[18px] rounded-tl border border-[#E6ECE8] bg-white p-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-sans text-base font-bold text-pine">
            Driving licence details
          </h3>
          <p className="font-sans text-xs font-medium text-[#768783]">
            {confidence !== null ? `Confidence ${confidence}%` : "Review DL number"}
          </p>
        </div>

        {payload.dlWarning ? (
          <p className="rounded-lg bg-[#FFF8E8] px-3 py-2 font-sans text-xs font-medium text-[#7A5A00]">
            {payload.dlWarning}
          </p>
        ) : null}

        <div className="flex flex-col gap-1 rounded-xl border border-[#EDF2EE] bg-white p-3">
          <span className="font-sans text-[10px] font-bold uppercase text-[#768783]">
            DL number
          </span>
          <input
            value={dlNumber}
            onChange={(event) => setDlNumber(event.target.value)}
            disabled={disabled}
            placeholder="e.g. MH01 20110012345"
            className="w-full border-b border-input-border bg-transparent font-sans text-sm font-bold text-pine outline-none disabled:opacity-50"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={disabled || !dlNumber.trim()}
        onClick={() =>
          onConfirm({ ...payload, dlNumber: dlNumber.trim(), dlError: undefined })
        }
        className="rounded-full bg-pine-primary px-4 py-2.5 font-sans text-sm font-bold text-white disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}
