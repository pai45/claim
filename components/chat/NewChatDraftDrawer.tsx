"use client";

import { useRef } from "react";
import { useModalFocus } from "@/lib/ui/useModalFocus";

type NewChatDraftDrawerProps = {
  open: boolean;
  mode?: "new-chat" | "new-bill";
  onKeepDraft: () => void;
  onStartWithoutSaving: () => void;
  onClose: () => void;
};

export function NewChatDraftDrawer({
  open,
  mode = "new-chat",
  onKeepDraft,
  onStartWithoutSaving,
  onClose,
}: NewChatDraftDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  useModalFocus(drawerRef, open, onClose);
  const isNewBill = mode === "new-bill";

  return (
    <div
      ref={drawerRef}
      className={`fixed inset-0 z-[80] mx-auto max-w-phone ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close new chat options"
        onClick={onClose}
        className={`absolute inset-0 bg-pine-dark/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-chat-drawer-title"
        aria-describedby="new-chat-drawer-description"
        className={`absolute inset-x-0 bottom-0 rounded-t-bubble bg-white px-page pb-8 pt-3 shadow-drawer transition-transform duration-300 ease-out motion-reduce:transition-none ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-pill bg-border-muted" />

        <header className="flex items-start justify-between gap-3">
          <div>
            <h2 id="new-chat-drawer-title" className="type-section-title text-pine">
              {isNewBill ? "Keep the previous bill in draft?" : "Start a new chat?"}
            </h2>
            <p
              id="new-chat-drawer-description"
              className="mt-1 type-body-secondary"
            >
              {isNewBill
                ? "Save the previous bill as a draft before continuing with the new bill."
                : "Keep each unsubmitted bill as a draft, or start again without saving it."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-pill text-ink-secondary hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-pine-primary"
            aria-label="Close"
          >
            <span aria-hidden>×</span>
          </button>
        </header>

        <div className="mt-5 flex flex-col gap-2">
          <button type="button" onClick={onKeepDraft} className="btn-primary w-full">
            {isNewBill ? "Keep in draft" : "Keep my draft"}
          </button>
          <button
            type="button"
            onClick={onStartWithoutSaving}
            className="btn-secondary w-full"
          >
            Start without saving
          </button>
        </div>
      </section>
    </div>
  );
}
