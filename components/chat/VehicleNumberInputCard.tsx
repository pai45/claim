"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  formatRegNumberInput,
  parseRegNumber,
} from "@/lib/vehicle/regNumber";
import { lookupRto } from "@/lib/vehicle/rtoCodes";

type VehicleNumberInputCardProps = {
  onSubmit: (regNumber: string) => void;
  disabled?: boolean;
};

export function VehicleNumberInputCard({
  onSubmit,
  disabled,
}: VehicleNumberInputCardProps) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  const parsed = useMemo(() => parseRegNumber(value), [value]);

  // Decoding is instant and offline, so the state/RTO can be shown as they type
  const location = useMemo(() => {
    if (!parsed.ok || !parsed.value.stateCode) return undefined;
    return lookupRto(parsed.value.stateCode, parsed.value.rtoCode);
  }, [parsed]);

  const showError = touched && value.length > 0 && !parsed.ok;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (disabled || !parsed.ok) {
      setTouched(true);
      return;
    }
    onSubmit(parsed.value.normalized);
  }

  return (
    <div className="w-full max-w-[340px] rounded-2xl border border-input-border bg-white p-4 shadow-[2px_2px_10px_rgba(0,42,25,0.05)]">
      <h3 className="font-display text-base font-bold text-pine">
        Vehicle number
      </h3>
      <p className="mt-0.5 font-sans text-xs text-subtle">
        Enter the number on your number plate
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
        <input
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          onChange={(event) => setValue(formatRegNumberInput(event.target.value))}
          onBlur={() => setTouched(true)}
          placeholder="MH 01 AB 1234"
          disabled={disabled}
          aria-invalid={showError}
          aria-describedby="vehicle-number-hint"
          className="w-full rounded-xl border border-input-border bg-[#F8FBFA] px-3 py-2.5 font-sans text-sm font-bold uppercase tracking-wider text-body outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-muted focus:border-pine disabled:opacity-50"
        />

        <p id="vehicle-number-hint" className="min-h-[16px] font-sans text-xs">
          {showError ? (
            <span className="text-[#B3261E]">{parsed.message}</span>
          ) : location ? (
            <span className="text-subtle">
              Registered in{" "}
              <span className="font-semibold text-pine">
                {location.officeKnown
                  ? `${location.office}, ${location.stateName}`
                  : location.stateName}
              </span>
            </span>
          ) : null}
        </p>

        <button
          type="submit"
          disabled={disabled || !parsed.ok}
          className="rounded-xl bg-pine-primary px-3 py-2.5 font-sans text-sm font-semibold text-white disabled:opacity-50"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
