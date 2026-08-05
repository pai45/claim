"use client";

import { forwardRef, type FormEvent } from "react";
import { COUNTRY_CODE } from "@/features/auth/phoneNumber";
import { IndiaFlagIcon } from "./IndiaFlagIcon";
import { LegalLine } from "./LegalLine";

type PhoneStepProps = {
  mobile: string;
  canSubmit: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export const PhoneStep = forwardRef<HTMLInputElement, PhoneStepProps>(
  function PhoneStep({ mobile, canSubmit, onChange, onSubmit }, ref) {
    function handleSubmit(event: FormEvent) {
      event.preventDefault();
      onSubmit();
    }

    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h1 className="type-screen-title">Let&apos;s get started</h1>

        <div className="flex flex-col gap-2">
          <label htmlFor="login-mobile" className="type-field-label">
            Enter mobile number
          </label>

          <div className="field-focus-shell flex min-h-14 items-center gap-2 rounded-control border border-input-border bg-input-soft px-3">
            {/* Decoration: the label already announces what the field is, and
                there is only one country to choose from. */}
            <span
              aria-hidden="true"
              className="flex shrink-0 items-center gap-1.5 text-body font-bold text-pine"
            >
              <IndiaFlagIcon />
              {COUNTRY_CODE}
            </span>

            <input
              ref={ref}
              id="login-mobile"
              type="tel"
              inputMode="numeric"
              // `tel-national`, not `tel`: the +91 lives outside the field, so
              // `tel` would autofill a country code into a 10-digit box.
              autoComplete="tel-national"
              // No `maxLength`: it counts characters, so it would clip
              // "+91 98765 43210" to ten *characters* before onChange runs and
              // defeat the country-code strip. `formatMobileInput` caps the
              // controlled value at ten digits instead.
              placeholder="9876543210"
              aria-describedby="login-mobile-hint"
              value={mobile}
              onChange={(event) => onChange(event.target.value)}
              className="w-full bg-transparent text-body font-bold tracking-wide text-pine outline-none placeholder:font-normal placeholder:text-muted"
            />
          </div>

          <p id="login-mobile-hint" className="text-caption text-ink-secondary">
            Use the mobile number linked to your prepaid account
          </p>
        </div>

        <LegalLine />

        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-primary"
        >
          Continue
        </button>
      </form>
    );
  },
);
