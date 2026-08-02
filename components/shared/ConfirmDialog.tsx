"use client";

import { useRef } from "react";
import { useModalFocus } from "@/lib/ui/useModalFocus";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useModalFocus(containerRef, open, onClose);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[70] mx-auto max-w-phone ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Cancel"
        onClick={onClose}
        className={`absolute inset-0 bg-black/35 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className={`absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-card bg-white p-5 shadow-menu transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      >
        <h2 id="confirm-dialog-title" className="type-section-title">{title}</h2>
        <p id="confirm-dialog-description" className="mt-2 type-body-secondary">{description}</p>
        <div className="mt-5 flex flex-col gap-2">
          <button type="button" onClick={onConfirm} className="btn-primary min-h-11 h-auto py-3">{confirmLabel}</button>
          <button type="button" onClick={onClose} className="btn-secondary min-h-11 h-auto py-3">Keep my draft</button>
        </div>
      </section>
    </div>
  );
}
