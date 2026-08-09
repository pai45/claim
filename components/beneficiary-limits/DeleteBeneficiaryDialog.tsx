"use client";

import { useRef } from "react";
import { useModalFocus } from "@/lib/ui/useModalFocus";

type DeleteBeneficiaryDialogProps = {
  open: boolean;
  beneficiaryName: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function DeleteBeneficiaryDialog({
  open,
  beneficiaryName,
  onConfirm,
  onClose,
}: DeleteBeneficiaryDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalFocus(dialogRef, open, onClose);

  return (
    <div
      ref={dialogRef}
      className={`fixed inset-0 z-[70] mx-auto max-w-phone ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close delete confirmation"
        onClick={onClose}
        className={`absolute inset-0 bg-pine/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-beneficiary-title"
        aria-describedby="delete-beneficiary-description"
        className={`absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-card bg-white p-5 shadow-menu transition-all duration-200 ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <h2
          id="delete-beneficiary-title"
          className="type-section-title text-pine"
        >
          Delete beneficiary?
        </h2>
        <p
          id="delete-beneficiary-description"
          className="mt-2 type-body-secondary"
        >
          {beneficiaryName
            ? `This will remove the limits set for ${beneficiaryName}.`
            : "This will remove the selected beneficiary limits."}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="flex min-h-11 w-full items-center justify-center rounded-control bg-danger px-4 py-3 text-body-sm font-bold text-white"
          >
            Delete beneficiary
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary min-h-11 h-auto py-3"
          >
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}
