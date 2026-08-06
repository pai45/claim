"use client";

type ChatExtractCardProps = {
  title?: string;
  amount: string;
  merchant: string;
  date: string;
  category: string;
  onConfirm: () => void;
  onEdit: () => void;
};

export function ChatCardTemplate({
  title = "Extracted Receipt",
  amount,
  merchant,
  date,
  category,
  onConfirm,
  onEdit,
}: ChatExtractCardProps) {
  return (
    <div className="w-full max-w-card overflow-hidden rounded-bubble rounded-tl border border-border-line bg-white shadow-card">
      {/* Header Tint */}
      <div className="flex items-center justify-between border-b border-border-line bg-surface-tint px-card py-2.5">
        <span className="type-field-label text-pine-primary">{title}</span>
        <span className="rounded-pill bg-success-tint px-2 py-0.5 text-caption font-bold text-success">
          {category}
        </span>
      </div>

      {/* Main Details */}
      <div className="flex flex-col gap-2 p-card">
        <div>
          <span className="text-caption text-ink-secondary">Total Amount</span>
          <p className="type-amount text-title">{amount}</p>
        </div>

        <div className="flex justify-between border-t border-border-soft pt-2 text-caption">
          <span className="text-ink-secondary">Merchant</span>
          <span className="font-bold text-pine">{merchant}</span>
        </div>

        <div className="flex justify-between text-caption">
          <span className="text-ink-secondary">Date</span>
          <span className="font-bold text-pine">{date}</span>
        </div>

        {/* Actions */}
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="flex min-h-11 flex-1 items-center justify-center rounded-control bg-pine-primary text-caption font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="flex min-h-11 flex-1 items-center justify-center rounded-control border border-border-muted bg-white text-caption font-bold text-pine transition-colors hover:bg-surface-muted active:scale-[0.98]"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
