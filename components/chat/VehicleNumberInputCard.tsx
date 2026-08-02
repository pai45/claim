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
    <div className="w-full max-w-card rounded-card border border-input-border bg-white p-card shadow-card">
      <h3 className="type-section-title text-pine">
        Vehicle number
      </h3>
      <p className="mt-0.5 type-body-secondary text-subtle">
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
          className="w-full rounded-control border border-input-border bg-input-soft px-3 py-2.5 text-body-sm font-bold uppercase tracking-wider text-body outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-muted focus:border-pine disabled:opacity-50"
        />

        <p id="vehicle-number-hint" className="min-h-[16px] text-caption">
          {showError ? (
            <span className="text-danger">{parsed.message}</span>
          ) : location ? (
            <span className="text-subtle">
              Registered in{" "}
              <span className="font-bold text-pine">
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
          className="rounded-control bg-pine-primary px-3 py-2.5 text-body-sm font-bold text-white disabled:opacity-50"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
