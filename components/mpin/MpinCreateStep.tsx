"use client";

import { useEffect, useState } from "react";
import { EyeToggle } from "@/components/mpin/EyeToggle";
import { MpinDots } from "@/components/mpin/MpinDots";
import { MpinHeader } from "@/components/mpin/MpinHeader";
import { NumericKeypad } from "@/components/mpin/NumericKeypad";
import type { MpinField } from "@/features/auth/mpinMachine";

type MpinCreateStepProps = {
  pin: string[];
  confirm: string[];
  activeField: MpinField;
  onSelectField: (field: MpinField) => void;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  error?: string | null;
  shakeKey?: number;
  onBack: () => void;
  saving?: boolean;
};

export function MpinCreateStep({
  pin,
  confirm,
  activeField,
  onSelectField,
  onDigit,
  onBackspace,
  onSubmit,
  canSubmit,
  error = null,
  shakeKey = 0,
  onBack,
  saving = false,
}: MpinCreateStepProps) {
  const [revealed, setRevealed] = useState<Record<MpinField, boolean>>({
    pin: false,
    confirm: false,
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (saving || event.ctrlKey || event.metaKey || event.altKey) return;

      if (/^\d$/.test(event.key)) {
        event.preventDefault();
        onDigit(event.key);
      } else if (event.key === "Backspace") {
        event.preventDefault();
        onBackspace();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBackspace, onDigit, saving]);

  function toggleReveal(field: MpinField) {
    setRevealed((current) => ({ ...current, [field]: !current[field] }));
  }

  return (
    <>
      <MpinHeader onBack={onBack} />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-3 pt-4">
        <h1 className="type-screen-title">Create MPIN</h1>
        <p className="type-body-secondary mt-1">
          Create a 4-digit PIN for secure access
        </p>

        <div className="mt-5">
          <p className="type-body-secondary">Type your MPIN</p>
          <div className="mt-2 flex items-center gap-2">
            <MpinDots
              digits={pin}
              revealed={revealed.pin}
              label="Type your MPIN"
              active={activeField === "pin"}
              onSelect={() => onSelectField("pin")}
            />
            <EyeToggle
              revealed={revealed.pin}
              onToggle={() => toggleReveal("pin")}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="type-body-secondary">Retry your MPIN</p>
          <div className="mt-2 flex items-center gap-2">
            <MpinDots
              digits={confirm}
              revealed={revealed.confirm}
              invalid={Boolean(error)}
              shakeKey={shakeKey}
              label="Retry your MPIN"
              active={activeField === "confirm"}
              onSelect={() => onSelectField("confirm")}
            />
            <EyeToggle
              revealed={revealed.confirm}
              onToggle={() => toggleReveal("confirm")}
            />
          </div>
        </div>

        <p
          role="status"
          aria-live="polite"
          className="min-h-4 pt-2 text-caption text-danger"
        >
          {error}
        </p>
      </main>

      <div className="shrink-0 bg-white px-page pb-3 pt-2">
        <button
          type="button"
          className="btn-primary"
          disabled={!canSubmit || saving}
          onClick={onSubmit}
        >
          Continue
        </button>
      </div>

      <NumericKeypad
        onDigit={onDigit}
        onBackspace={onBackspace}
        disabled={saving}
      />
    </>
  );
}
