"use client";

/* eslint-disable @next/next/no-img-element -- IndexedDB previews use object URLs */

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useRouter } from "next/navigation";
import { AppIcon } from "@/components/shared/AppIcon";
import { AppShell } from "@/components/shared/AppShell";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { markInAppClaimsEntry } from "@/features/auth/directClaimsEntry";
import {
  BILL_DRAFT_DELETE_HINT_KEY,
  BILL_DRAFT_LIMIT,
  BILL_DRAFT_RETENTION_DAYS,
  billDraftStore,
  type BillDraft,
} from "@/features/chat/drafts";
import { setPendingChatIntent } from "@/features/chat/pendingIntent";
import { formatINR } from "@/features/dashboard/constants";
import { UI_ICONS } from "@/lib/ui/assets";
import { staggerStyle } from "@/lib/ui/staggerStyle";

const DELETE_WIDTH = 92;

function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatSavedAt(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function expiryLabel(expiresAt: number): string {
  const remaining = expiresAt - Date.now();
  const days = Math.ceil(remaining / (24 * 60 * 60 * 1000));
  return days <= 1 ? "Expires today" : `${days} days left`;
}

function amountLabel(value?: string): string {
  const amount = Number(value?.replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) && amount > 0 ? formatINR(amount) : "Amount pending";
}

type DraftRowProps = {
  draft: BillDraft;
  index: number;
  showDeleteHint: boolean;
  onOpen: () => void;
  onDelete: () => void;
};

function DraftRow({
  draft,
  index,
  showDeleteHint,
  onOpen,
  onDelete,
}: DraftRowProps) {
  const [revealed, setRevealed] = useState(false);
  const [previewUrl] = useState(() =>
    draft.fileBlob ? URL.createObjectURL(draft.fileBlob) : undefined,
  );
  const startXRef = useRef<number | null>(null);
  const deltaXRef = useRef(0);
  const draggedRef = useRef(false);
  const revealTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const extract = draft.extract;

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  useEffect(() => {
    if (!showDeleteHint) return;

    try {
      window.localStorage.setItem(BILL_DRAFT_DELETE_HINT_KEY, "true");
    } catch {
      // The hint remains harmless when browser storage is blocked.
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    revealTimerRef.current = window.setTimeout(() => setRevealed(true), 500);
    closeTimerRef.current = window.setTimeout(() => setRevealed(false), 1900);

    return () => {
      if (revealTimerRef.current !== null) {
        window.clearTimeout(revealTimerRef.current);
      }
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, [showDeleteHint]);

  function cancelDeleteHint() {
    if (revealTimerRef.current !== null) {
      window.clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    cancelDeleteHint();
    startXRef.current = event.clientX;
    deltaXRef.current = 0;
    draggedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (startXRef.current === null) return;
    const delta = event.clientX - startXRef.current;
    deltaXRef.current = delta;
    if (Math.abs(delta) > 8) draggedRef.current = true;
  }

  function handlePointerEnd() {
    if (startXRef.current === null) return;
    if (deltaXRef.current < -36) setRevealed(true);
    if (deltaXRef.current > 36) setRevealed(false);
    startXRef.current = null;
  }

  function handleOpen() {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    if (revealed) {
      setRevealed(false);
      return;
    }
    onOpen();
  }

  return (
    <article
      className="animate-rise-in relative overflow-hidden rounded-card border border-border-line bg-danger-soft shadow-card"
      style={staggerStyle(index)}
    >
      <button
        type="button"
        onClick={handleOpen}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        className="relative z-10 flex min-h-28 w-full touch-pan-y items-center gap-3 bg-white p-card text-left transition-transform duration-300 ease-out motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-pine-primary"
        style={{ transform: `translateX(${revealed ? -DELETE_WIDTH : 0}px)` }}
      >
        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-control border border-border-line bg-surface-tint text-pine-primary">
          {draft.previewAsset ? (
            <AppIcon
              src={draft.previewAsset}
              alt=""
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          ) : previewUrl && draft.fileBlob?.type.startsWith("image/") ? (
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <AppIcon src={UI_ICONS.chatDrafts} size={28} alt="" />
          )}
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate type-body font-bold text-pine">
            {extract.vendor || extract.merchant || extract.fileName}
          </span>
          <span className="truncate type-body-secondary">
            {extract.category || "Category needs review"} · {amountLabel(extract.amount)}
          </span>
          <span className="text-caption text-ink-secondary">
            Saved {formatSavedAt(draft.updatedAt)} · {expiryLabel(draft.expiresAt)}
          </span>
        </span>

        <span aria-hidden className="shrink-0 text-title text-pine-primary">
          ›
        </span>
      </button>

      <button
        type="button"
        aria-label={`Delete ${extract.vendor || extract.fileName}`}
        onFocus={() => {
          cancelDeleteHint();
          setRevealed(true);
        }}
        onClick={onDelete}
        className="absolute inset-y-0 right-0 z-0 flex min-h-11 w-23 flex-col items-center justify-center gap-1 bg-danger px-2 text-caption font-bold text-white focus-visible:outline-2 focus-visible:outline-pine-primary"
      >
        <TrashIcon />
        Delete
      </button>
    </article>
  );
}

export function ChatDraftsScreen() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<BillDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BillDraft | null>(null);
  const [deleteHintDraftId, setDeleteHintDraftId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void billDraftStore
      .list()
      .then((records) => {
        if (!active) return;
        setDrafts(records);
        if (records.length > 0) {
          try {
            if (
              window.localStorage.getItem(BILL_DRAFT_DELETE_HINT_KEY) !== "true"
            ) {
              setDeleteHintDraftId(records[0].id);
            }
          } catch {
            setDeleteHintDraftId(records[0].id);
          }
        }
      })
      .catch(() => {
        if (active) setError("Drafts could not be loaded in this browser.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function returnToClaims() {
    markInAppClaimsEntry();
    router.push("/#claims");
  }

  function openDraft(draftId: string) {
    setPendingChatIntent({ kind: "bill_draft", draftId });
    returnToClaims();
  }

  async function deleteDraft() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    try {
      await billDraftStore.delete(id);
      setDrafts((current) => current.filter((draft) => draft.id !== id));
    } catch {
      setError("That draft could not be deleted. Please try again.");
    }
  }

  return (
    <AppShell className="overflow-hidden">
      <ScreenHeader title="Chat drafts" onBack={returnToClaims} />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-8 pt-4">
        <section className="rounded-control border border-input-border bg-surface-tint px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="type-body font-bold text-pine">
              Save up to {BILL_DRAFT_LIMIT} bills for up to {BILL_DRAFT_RETENTION_DAYS} days.
            </p>
            <span className="shrink-0 rounded-pill bg-white px-2.5 py-1 text-caption font-bold text-pine shadow-soft">
              {drafts.length}/{BILL_DRAFT_LIMIT}
            </span>
          </div>
          <p className="mt-1 type-body-secondary">
            Drafts stay only in this browser. Swipe a bill left to delete it.
          </p>
        </section>

        {error ? (
          <p role="alert" className="mt-4 rounded-control bg-danger-soft px-3 py-2.5 type-body-secondary text-danger">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="type-body-secondary">Loading drafts…</p>
          </div>
        ) : drafts.length === 0 ? (
          <section className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-card bg-surface-tint text-pine-primary shadow-icon">
              <AppIcon src={UI_ICONS.chatDrafts} size={32} alt="" />
            </span>
            <h2 className="mt-4 type-section-title text-pine">No bill drafts yet</h2>
            <p className="mt-2 max-w-card type-body-secondary">
              Scan a bill in Benefits assistant and choose Save draft to keep it for later.
            </p>
            <button
              type="button"
              onClick={returnToClaims}
              className="btn-primary mt-5 w-full max-w-card"
            >
              Upload a bill
            </button>
          </section>
        ) : (
          <section className="mt-4 flex flex-col gap-3" aria-label="Saved bill drafts">
            {drafts.map((draft, index) => (
              <DraftRow
                key={draft.id}
                draft={draft}
                index={index}
                showDeleteHint={draft.id === deleteHintDraftId}
                onOpen={() => openDraft(draft.id)}
                onDelete={() => setDeleteTarget(draft)}
              />
            ))}
          </section>
        )}
      </main>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this draft?"
        description={`This removes ${deleteTarget?.extract.vendor || deleteTarget?.extract.fileName || "the selected bill"} and its saved bill file from this browser.`}
        confirmLabel="Delete draft"
        cancelLabel="Keep draft"
        onConfirm={() => void deleteDraft()}
        onClose={() => setDeleteTarget(null)}
      />
    </AppShell>
  );
}
