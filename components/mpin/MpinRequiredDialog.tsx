"use client";

import { useRef } from "react";
import { useModalFocus } from "@/lib/ui/useModalFocus";

type MpinRequiredDialogProps = {
  open: boolean;
  onReturnToSetup: () => void;
};

export function MpinRequiredDialog({
  open,
  onReturnToSetup,
}: MpinRequiredDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalFocus(dialogRef, open, onReturnToSetup);

  return (
    <div
      ref={dialogRef}
      className={`fixed inset-0 z-[90] mx-auto max-w-phone ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Return to MPIN setup"
        onClick={onReturnToSetup}
        className={`absolute inset-0 bg-pine-dark/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="mpin-required-title"
        aria-describedby="mpin-required-description"
        className={`absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-card bg-white p-card shadow-menu transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        <h2 id="mpin-required-title" className="type-section-title text-pine">
          MPIN setup required
        </h2>
        <p id="mpin-required-description" className="mt-2 type-body-secondary">
          You cannot continue without setting up your 4-digit MPIN.
        </p>
        <button
          type="button"
          className="btn-primary mt-5"
          onClick={onReturnToSetup}
        >
          Set up MPIN
        </button>
      </section>
    </div>
  );
}
