"use client";

import { useRef } from "react";
import { createPortal } from "react-dom";
import { colors } from "@/lib/ui/colors";
import { useModalFocus } from "@/lib/ui/useModalFocus";

type AutoApprovalEditSheetProps = {
  open: boolean;
  score: number;
  /** Proceed into edit mode; auto approval remains until a field changes. */
  onConfirm: () => void;
  /** Dismiss without entering edit mode. */
  onClose: () => void;
};

/**
 * Mirrors the card-activation / PIN success sheet: a centred sheet with a seal
 * badge straddling its top edge, a dismiss cross, and a two-up action row. The
 * seal is amber rather than green because this one is a caution, not a
 * confirmation.
 */
export function AutoApprovalEditSheet({
  open,
  score,
  onConfirm,
  onClose,
}: AutoApprovalEditSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  useModalFocus(sheetRef, open, onClose);

  // A closed fixed sheet must not fall back into the animated chat-message
  // subtree: that changes its containing block and can leave the translated
  // panel visible above the composer. Remove it from the DOM completely.
  if (!open) return null;

  const sheet = (
    <div
      ref={sheetRef}
      className="fixed inset-0 z-[80] mx-auto max-w-phone"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close auto approval notice"
        onClick={onClose}
        className="absolute inset-0 bg-ink/80"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="auto-approval-edit-title"
        aria-describedby="auto-approval-edit-description"
        className="animate-sheet-rise absolute inset-x-0 bottom-0 rounded-t-bubble bg-white px-page pb-[max(24px,env(safe-area-inset-bottom))] pt-17 text-center shadow-drawer motion-reduce:animate-none"
      >
        {/* The seal carries its own white disc, so the sheet's 68px top padding
            clears the half that hangs inside. */}
        <span
          className="absolute -top-12 left-1/2 grid h-24 w-24 -translate-x-1/2 place-items-center"
          aria-hidden
        >
          <CautionSeal />
        </span>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-pill text-ink-secondary focus-visible:outline-2 focus-visible:outline-pine-primary"
          aria-label="Close auto approval notice"
        >
          <CloseIcon />
        </button>

        <h2 id="auto-approval-edit-title" className="type-screen-title text-ink">
          Editing turns off auto approval
        </h2>
        <p
          id="auto-approval-edit-description"
          className="mt-3.5 type-body-secondary text-ink-secondary"
        >
          This claim scored {score}% and is set to auto-approve. If you change any
          detail, it goes to HR for manual review instead, which takes longer.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3.5">
          <button type="button" className="btn-primary" onClick={onConfirm}>
            Continue
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </section>
    </div>
  );

  // Chat messages animate with a transform, which otherwise makes a nested
  // `position: fixed` sheet use the message as its containing block. Portal to
  // the assistant's own full-screen layer so the sheet covers that viewport
  // and remains above the chat composer. The frame/body fallbacks keep the
  // component safe when rendered outside the host during isolated checks.
  const portalTarget =
    typeof document === "undefined"
      ? null
      : document.querySelector<HTMLElement>(".employee-benefits-claims") ??
        document.querySelector<HTMLElement>(".desktop-mobile-frame") ??
        document.body;

  return portalTarget ? createPortal(sheet, portalTarget) : sheet;
}

/** The `icon-success-seal` scallop, recoloured amber and carrying an alert mark. */
function CautionSeal() {
  return (
    <svg width="96" height="96" viewBox="0 0 106 106" fill="none" aria-hidden>
      <circle cx="53" cy="53" r="53" fill={colors.white} />
      <g transform="translate(18 18)">
        <path
          d="M64.4008 28.5367L62.0164 25.6492C61.2836 24.7523 60.8352 23.6695 60.7258 22.5211L60.3648 18.7914C59.9055 13.957 56.0555 10.107 51.2211 9.64766L47.4914 9.28672C46.343 9.17734 45.2602 8.72891 44.3633 7.98516L41.4758 5.60078C37.7242 2.50547 32.2883 2.50547 28.5367 5.60078L25.6492 7.98516C24.7523 8.71797 23.6695 9.17734 22.5211 9.28672L18.7914 9.64766C13.957 10.107 10.107 13.957 9.64766 18.7914L9.28672 22.5211C9.17734 23.6805 8.72891 24.7633 7.98516 25.6492L5.60078 28.5367C2.50547 32.2883 2.50547 37.7242 5.60078 41.4758L7.98516 44.3633C8.71797 45.2602 9.16641 46.343 9.27578 47.4914L9.63672 51.2211C10.0961 56.0555 13.9461 59.9055 18.7805 60.3648L22.5102 60.7258C23.6586 60.8352 24.7414 61.2836 25.6383 62.0273L28.5258 64.4117C30.3961 65.9539 32.693 66.7305 34.9898 66.7305C37.2867 66.7305 39.5836 65.9539 41.4539 64.4117L44.3414 62.0273C45.2383 61.2945 46.3211 60.8352 47.4695 60.7258L51.1992 60.3648C56.0336 59.9055 59.8836 56.0555 60.343 51.2211L60.7039 47.4914C60.8133 46.332 61.2617 45.2492 62.0055 44.3633L64.3898 41.4758C67.4852 37.7242 67.4852 32.2883 64.3898 28.5367H64.4008Z"
          fill={colors.warning}
        />
        <path
          d="M35 19.5v18"
          stroke={colors.white}
          strokeWidth="4.6"
          strokeLinecap="round"
        />
        <circle cx="35" cy="47.5" r="2.9" fill={colors.white} />
      </g>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
