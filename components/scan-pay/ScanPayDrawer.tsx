"use client";

import { useRef, type ReactNode } from "react";
import { ScanPayIcon } from "@/components/scan-pay/ScanPayIcons";
import { useModalFocus } from "@/lib/ui/useModalFocus";

export function ScanPayDrawer({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);
  useModalFocus(drawerRef, open, onClose);
  if (!open) return null;

  return (
    <div
      ref={drawerRef}
      className="absolute inset-0 z-40 mx-auto max-w-phone"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scan-pay-drawer-title"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close drawer"
        onClick={onClose}
        className="absolute inset-0 bg-pine-dark/40"
      />
      <section className="animate-sheet-rise absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-y-auto rounded-t-bubble bg-white px-page pb-8 pt-3 shadow-drawer">
        <div className="mx-auto mb-3 h-1 w-10 rounded-pill bg-border-muted" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="scan-pay-drawer-title" className="type-section-title">
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 type-body-secondary">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-control text-ink-secondary"
            aria-label="Close"
          >
            <ScanPayIcon name="close" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </section>
    </div>
  );
}
