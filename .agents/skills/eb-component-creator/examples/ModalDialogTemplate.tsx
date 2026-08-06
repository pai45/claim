"use client";

import { useRef } from "react";
import { useModalFocus } from "@/lib/ui/useModalFocus";

type ModalDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function ModalDialogTemplate({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
}: ModalDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useModalFocus(containerRef, open, onClose);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[70] mx-auto max-w-phone ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* Dimmed Backdrop */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close dialog"
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Accessible Dialog Card */}
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        className={`absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-card bg-white p-5 shadow-menu transition-all duration-200 ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <h2 id="modal-title" className="type-section-title text-pine">
          {title}
        </h2>
        <p id="modal-desc" className="mt-2 type-body-secondary">
          {description}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="btn-primary min-h-11 h-auto py-3"
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary min-h-11 h-auto py-3"
          >
            {cancelLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
