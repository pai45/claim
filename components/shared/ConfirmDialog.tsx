"use client";

import { useRef } from "react";
import { useModalFocus } from "@/lib/ui/useModalFocus";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  /** Defaults to the chat-clear wording; pass one for any other dialog. */
  cancelLabel?: string;
  /** Optional third choice, rendered under the two standard buttons. */
  extraAction?: {
    label: string;
    /** Small line under the button, for choices that need a warning. */
    hint?: string;
    onSelect: () => void;
  };
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Keep my draft",
  extraAction,
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
          <button type="button" onClick={onClose} className="btn-secondary min-h-11 h-auto py-3">{cancelLabel}</button>
          {extraAction ? (
            <div className="mt-1 border-t border-border-line pt-3">
              <button
                type="button"
                onClick={extraAction.onSelect}
                className="btn-secondary min-h-11 h-auto w-full py-3"
              >
                {extraAction.label}
              </button>
              {extraAction.hint ? (
                <p className="mt-2 text-center text-caption text-subtle">
                  {extraAction.hint}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
