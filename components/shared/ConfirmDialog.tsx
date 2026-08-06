"use client";

import { useRef } from "react";
import { useModalFocus } from "@/lib/ui/useModalFocus";

export type ConfirmDialogExtraAction = {
  label: string;
  /** Small line under the button, for choices that need a warning or description. */
  hint?: string;
  onSelect: () => void;
  tone?: "default" | "brand" | "danger";
};

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  /** Defaults to the chat-clear wording; pass one for any other dialog. */
  cancelLabel?: string;
  /** Optional single third choice (for backward compatibility). */
  extraAction?: ConfirmDialogExtraAction;
  /** Optional list of extra choices rendered under the standard buttons. */
  extraActions?: ConfirmDialogExtraAction[];
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
  extraActions,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useModalFocus(containerRef, open, onClose);

  const actionsList: ConfirmDialogExtraAction[] = [
    ...(extraActions ?? []),
    ...(extraAction && !extraActions ? [extraAction] : []),
  ];

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
          {actionsList.length > 0 ? (
            <div className="mt-2 border-t border-border-line pt-3 flex flex-col gap-3">
              {actionsList.map((action, index) => (
                <div key={index} className="flex flex-col">
                  <button
                    type="button"
                    onClick={action.onSelect}
                    className={`btn-secondary min-h-11 h-auto w-full py-3 text-sm font-semibold transition-all ${
                      action.tone === "brand"
                        ? "border-pine-dark/30 text-pine-dark bg-pine-dark/5 hover:bg-pine-dark/10"
                        : action.tone === "danger"
                          ? "border-danger/30 text-danger bg-danger/5 hover:bg-danger/10"
                          : ""
                    }`}
                  >
                    {action.label}
                  </button>
                  {action.hint ? (
                    <p className="mt-1 text-center text-caption text-subtle leading-tight px-1">
                      {action.hint}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
