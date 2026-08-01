"use client";

import { useRef, useState } from "react";
import type { VehicleLookupPayload } from "@/features/chat/types";

type VehicleDetailsCardProps = {
  messageId: string;
  payload: VehicleLookupPayload;
  onScanRc?: (messageId: string, file: File) => void;
  onManualEntry?: (
    messageId: string,
    maker: string,
    model: string,
  ) => void;
  onConfirm?: (messageId: string) => void;
  disabled?: boolean;
};

function CarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3 12.5h14M4.5 12.5V15a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5v-2.5m13 0V15a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-2.5"
        stroke="#0F3F37"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M3 12.5 4.2 8a1.5 1.5 0 0 1 1.45-1.1h8.7A1.5 1.5 0 0 1 15.8 8L17 12.5"
        stroke="#0F3F37"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="10.6" r="0.9" fill="#0F3F37" />
      <circle cx="14" cy="10.6" r="0.9" fill="#0F3F37" />
    </svg>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="shrink-0 font-sans text-[10px] font-bold uppercase tracking-wide text-[#768783]">
        {label}
      </span>
      <span className="truncate text-right font-sans text-sm font-bold text-pine">
        {value}
      </span>
    </div>
  );
}

export function VehicleDetailsCard({
  messageId,
  payload,
  onScanRc,
  onManualEntry,
  onConfirm,
  disabled,
}: VehicleDetailsCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [manual, setManual] = useState(false);
  const [maker, setMaker] = useState("");
  const [model, setModel] = useState("");

  if (payload.error) {
    return (
      <div className="w-full max-w-[340px] rounded-[18px] rounded-tl border border-[#E6ECE8] bg-white p-4">
        <p className="font-sans text-sm text-body">{payload.error}</p>
      </div>
    );
  }

  const { lookup } = payload;
  if (!lookup) return null;

  const identified = Boolean(lookup.identity?.maker || lookup.identity?.model);
  const busy = disabled || payload.scanning;

  function handleManualSubmit() {
    if (!maker.trim() && !model.trim()) return;
    onManualEntry?.(messageId, maker, model);
    setManual(false);
  }

  return (
    <div className="flex w-full max-w-[340px] flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-[18px] rounded-tl border border-[#E6ECE8] bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9F6F2]">
            <CarIcon />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h3 className="font-sans text-base font-bold tracking-wide text-pine">
              {lookup.regNumber.formatted}
            </h3>
            <p className="truncate font-sans text-xs font-medium text-[#768783]">
              {lookup.location
                ? lookup.location.officeKnown
                  ? `${lookup.location.office}, ${lookup.location.stateName}`
                  : lookup.location.stateName
                : "Registration decoded"}
            </p>
          </div>
        </div>

        {payload.regMismatch ? (
          <p className="rounded-lg bg-[#FDECEA] px-3 py-2 font-sans text-xs font-medium text-[#8C1D18]">
            {payload.regMismatch}
          </p>
        ) : null}

        {payload.warning ? (
          <p className="rounded-lg bg-[#FFF8E8] px-3 py-2 font-sans text-xs font-medium text-[#7A5A00]">
            {payload.warning}
          </p>
        ) : null}

        {identified ? (
          <div className="divide-y divide-[#EDF2EE] rounded-xl border border-[#EDF2EE] px-3 py-1">
            <Row label="Vehicle" value={lookup.identity?.makerModel} />
            <Row label="Fuel" value={lookup.identity?.fuel} />
            <Row label="Class" value={lookup.identity?.vehicleClass} />
            <Row label="Registered" value={lookup.identity?.registrationDate} />
            <Row label="Chassis" value={lookup.identity?.chassisNumber} />
            <Row label="Insurance till" value={lookup.identity?.insuranceValidTo} />
          </div>
        ) : (
          <p className="rounded-lg bg-[#F3F7F5] px-3 py-2 font-sans text-xs leading-4 text-subtle">
            The number plate only tells us where the vehicle was registered — the
            make and model aren&apos;t part of it. Scan your RC to fill them in.
          </p>
        )}

        {identified && lookup.source === "api" ? (
          <p className="font-sans text-[10px] font-medium text-[#768783]">
            From the RTO register
          </p>
        ) : null}

        {payload.scanning ? (
          <p className="font-sans text-xs font-medium text-subtle">
            Reading your RC…
          </p>
        ) : null}

        {manual ? (
          <div className="flex flex-col gap-2">
            <input
              value={maker}
              onChange={(event) => setMaker(event.target.value)}
              placeholder="Make (e.g. Maruti Suzuki)"
              className="w-full rounded-xl border border-input-border bg-[#F8FBFA] px-3 py-2 font-sans text-sm text-body outline-none placeholder:text-muted focus:border-pine"
            />
            <input
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="Model (e.g. Alto 800 LXI)"
              className="w-full rounded-xl border border-input-border bg-[#F8FBFA] px-3 py-2 font-sans text-sm text-body outline-none placeholder:text-muted focus:border-pine"
            />
            <button
              type="button"
              onClick={handleManualSubmit}
              disabled={!maker.trim() && !model.trim()}
              className="w-full rounded-full bg-pine-primary px-4 py-2.5 font-sans text-sm font-bold text-white disabled:opacity-50"
            >
              Save vehicle
            </button>
          </div>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onScanRc?.(messageId, file);
          event.target.value = "";
        }}
      />

      {payload.confirmed ? null : (
        <div className="flex flex-wrap content-start gap-2">
          {identified ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onConfirm?.(messageId)}
              className="rounded-full bg-pine-primary px-4 py-2.5 font-sans text-sm font-bold text-white disabled:opacity-50"
            >
              Confirm vehicle
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full border border-[#DCE7E3] bg-white px-4 py-2.5 font-sans text-sm font-bold text-pine disabled:opacity-50"
          >
            {identified ? "Rescan RC" : "Scan RC"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setManual((prev) => !prev)}
            className="rounded-full border border-[#DCE7E3] bg-white px-4 py-2.5 font-sans text-sm font-bold text-pine disabled:opacity-50"
          >
            {manual ? "Cancel" : "Enter manually"}
          </button>
        </div>
      )}
    </div>
  );
}
