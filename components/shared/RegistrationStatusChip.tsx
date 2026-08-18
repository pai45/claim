import type { RegistrationActionStatus } from "@/features/chat/homeActionCards";

/* Amber matches the pending glow the home card animates; the rejected pairing is
   the same one claims history uses for a rejected claim, so one status reads the
   same wherever it surfaces — the home card or the vehicle screen. */
const STATUS_CHIP: Record<
  RegistrationActionStatus,
  { label: string; className: string; dotClassName: string }
> = {
  pending: {
    label: "Pending",
    className: "border-warning-border bg-warning-tint text-warning",
    dotClassName: "bg-warning",
  },
  rejected: {
    label: "Rejected",
    className: "border-transparent bg-danger-soft text-danger",
    dotClassName: "bg-danger",
  },
};

export function RegistrationStatusChip({
  status,
}: {
  status: RegistrationActionStatus;
}) {
  const chip = STATUS_CHIP[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-pill border px-2 py-0.5 text-caption font-bold ${chip.className}`}
    >
      <span aria-hidden className={`size-1.5 rounded-pill ${chip.dotClassName}`} />
      {chip.label}
    </span>
  );
}
