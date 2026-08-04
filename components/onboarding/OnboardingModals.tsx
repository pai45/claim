"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useModalFocus } from "@/lib/ui/useModalFocus";
import { colors } from "@/lib/ui/colors";
import { SuccessSealIcon } from "./SuccessSealIcon";

type StatusModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  variant?: "success" | "error" | "info";
};

/** Success uses a bottom sheet; error/info stay centered. */
export function CenterModal({
  open,
  title,
  description,
  confirmLabel = "OK",
  onConfirm,
  onClose,
  variant = "success",
}: StatusModalProps) {
  if (variant === "success") {
    return (
      <SuccessBottomSheet
        open={open}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );
  }

  return (
    <CenteredStatusModal
      open={open}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      onConfirm={onConfirm}
      onClose={onClose}
      variant={variant}
    />
  );
}

function SuccessBottomSheet({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  useModalFocus(panelRef, open, onClose);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    overlay.inert = !open;
  }, [open]);

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[70] mx-auto max-w-phone ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Dismiss"
        onClick={onClose}
        className={`absolute inset-0 bg-black/35 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />
      <section
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="onboarding-success-title"
        className={`absolute inset-x-0 bottom-0 rounded-t-bubble bg-white px-page pb-[max(16px,env(safe-area-inset-bottom))] pt-5 shadow-drawer transition-transform ${open ? "translate-y-0" : "translate-y-full"}`}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full text-ink-secondary"
        >
          <CloseIcon />
        </button>
        <div className="flex flex-col items-center pt-2 text-center">
          <SuccessSealIcon size={72} />
          <h2
            id="onboarding-success-title"
            className="type-section-title mt-3"
          >
            {title}
          </h2>
          <p className="type-body-secondary mt-2 max-w-[300px]">{description}</p>
        </div>
        <button
          type="button"
          className="btn-primary mt-5 min-h-11 h-auto py-3"
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </section>
    </div>
  );
}

function CenteredStatusModal({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
  variant,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  variant: "error" | "info";
}) {
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
        aria-label="Dismiss"
        onClick={onClose}
        className={`absolute inset-0 bg-black/35 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="onboarding-modal-title"
        className={`absolute inset-x-5 top-1/2 -translate-y-1/2 rounded-card bg-white px-5 pb-5 pt-10 shadow-menu transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full text-ink-secondary"
        >
          <CloseIcon />
        </button>
        <div className="absolute -top-7 left-1/2 -translate-x-1/2">
          <StatusBadge variant={variant} />
        </div>
        <h2
          id="onboarding-modal-title"
          className="type-section-title text-center"
        >
          {title}
        </h2>
        <p className="type-body-secondary mt-2 text-center">{description}</p>
        <button
          type="button"
          className="btn-primary mt-5 min-h-11 h-auto py-3"
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </section>
    </div>
  );
}

function StatusBadge({ variant }: { variant: "error" | "info" }) {
  const bg = variant === "error" ? colors.danger : colors.warning;
  return (
    <span
      className="flex h-14 w-14 items-center justify-center rounded-full shadow-soft"
      style={{ background: bg }}
      aria-hidden="true"
    >
      {variant === "info" ? (
        <span className="text-title font-bold text-white">i</span>
      ) : (
        <XMark />
      )}
    </span>
  );
}

function XMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 7l10 10M17 7 7 17"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 7l10 10M17 7 7 17"
        stroke={colors.inkSecondary}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

type BottomSheetProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
};

export function BottomSheet({
  open,
  title,
  description,
  onClose,
  children,
  footer,
}: BottomSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  useModalFocus(panelRef, open, onClose);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    overlay.inert = !open;
  }, [open]);

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[70] mx-auto max-w-phone ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Dismiss"
        onClick={onClose}
        className={`absolute inset-0 bg-black/35 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-sheet-title"
        className={`absolute inset-x-0 bottom-0 rounded-t-bubble bg-white px-page pb-[max(16px,env(safe-area-inset-bottom))] pt-4 shadow-drawer transition-transform ${open ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 id="onboarding-sheet-title" className="type-section-title">
              {title}
            </h2>
            <div className="type-body-secondary mt-1">{description}</div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
        <div className="mt-5">{footer}</div>
      </section>
    </div>
  );
}
