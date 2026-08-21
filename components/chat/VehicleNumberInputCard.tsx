"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  formatRegNumberInput,
  parseRegNumber,
} from "@/lib/vehicle/regNumber";
import { lookupRto } from "@/lib/vehicle/rtoCodes";
import { VEHICLE_OWNERSHIP_OPTIONS } from "@/lib/vehicle/ownership";
import type { VehicleOwnership } from "@/lib/vehicle/types";

type VehicleNumberInputCardProps = {
  onSubmit: (regNumber: string, ownership: VehicleOwnership) => void;
  disabled?: boolean;
};

export function VehicleNumberInputCard({
  onSubmit,
  disabled,
}: VehicleNumberInputCardProps) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const [ownership, setOwnership] = useState<VehicleOwnership>("self_owned");

  const parsed = useMemo(() => parseRegNumber(value), [value]);

  // Decoding is instant and offline, so the state/RTO can be shown as they type
  const location = useMemo(() => {
    if (!parsed.ok || !parsed.value.stateCode) return undefined;
    return lookupRto(parsed.value.stateCode, parsed.value.rtoCode);
  }, [parsed]);

  const showError = touched && value.length > 0 && !parsed.ok;
  // Neither hint can fire on an untouched empty field, so the caption row only
  // reserves its line once there is something to say about — it would other-
  // wise sit as a blank band between the input and the ownership question.
  const showHintRow = value.length > 0;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (disabled || !parsed.ok || !ownership) {
      setTouched(true);
      return;
    }
    onSubmit(parsed.value.normalized, ownership);
  }

  return (
    <div className="w-full max-w-card rounded-card border border-input-border bg-white p-card shadow-card">
      <h3 className="type-section-title text-pine">
        Vehicle number
      </h3>
      <p className="mt-0.5 type-body-secondary text-subtle">
        Enter the number on your number plate
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
        <div>
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
            aria-describedby={showHintRow ? "vehicle-number-hint" : undefined}
            className="min-h-11 w-full rounded-control border border-input-border bg-input-soft px-3 py-2.5 text-body-sm font-bold uppercase tracking-wider text-body outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-muted focus:border-pine disabled:opacity-50"
          />

          {showHintRow ? (
            <p id="vehicle-number-hint" className="mt-1 min-h-4 text-caption">
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
          ) : null}
        </div>

        <fieldset className="border-t border-border-line pt-4">
          {/* A legend is not a flex item, so the fieldset's own gap would skip
              it — the spacing below it has to be its own margin. */}
          <legend className="mb-4 type-body text-subtle">
            Is this vehicle self owned or company leased?
          </legend>
          <div className="flex items-center justify-between gap-2">
            {VEHICLE_OWNERSHIP_OPTIONS.map((option) => {
              const isSelected = ownership === option.id;
              return (
                <label
                  key={option.id}
                  className={`flex min-h-11 shrink-0 cursor-pointer items-center gap-2.5 rounded-control whitespace-nowrap text-body font-bold transition-colors focus-within:outline-2 focus-within:outline-pine-primary focus-within:outline-offset-2 ${
                    disabled ? "cursor-not-allowed opacity-50" : ""
                  } ${isSelected ? "text-ink" : "text-ink-secondary"}`}
                >
                  <input
                    type="radio"
                    name="vehicle-ownership"
                    value={option.id}
                    checked={isSelected}
                    disabled={disabled}
                    onChange={() => setOwnership(option.id)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      isSelected
                        ? "border-pine-primary bg-pine-primary"
                        : "border-border-tab bg-white"
                    }`}
                  >
                    {isSelected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                  </span>
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={disabled || !parsed.ok || !ownership}
          className="min-h-11 rounded-control bg-pine-primary px-3 py-2.5 text-body-sm font-bold text-white disabled:opacity-50"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
