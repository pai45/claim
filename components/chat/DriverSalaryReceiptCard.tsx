import type { DriverSalaryPayload } from "@/features/chat/types";
import { colors } from "@/lib/ui/colors";

type DriverSalaryReceiptCardProps = {
  claimId: string;
  payload: DriverSalaryPayload;
  submittedAt: number;
};

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="9" fill={colors.success} />
      <path
        d="M5.5 9.2 7.6 11.2 12.5 6.5"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReceiptRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="shrink-0 text-caption text-ink-secondary">{label}</span>
      <span
        className={`truncate text-right ${
          emphasize
            ? "text-body font-bold text-pine"
            : "text-body-sm font-bold text-pine"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function formatSubmittedAt(timestamp: number) {
  return new Date(timestamp).toLocaleString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(value?: string) {
  if (!value) return "";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DriverSalaryReceiptCard({
  claimId,
  payload,
  submittedAt,
}: DriverSalaryReceiptCardProps) {
  const startDate = formatDate(payload.startDate);
  const dlValidity = formatDate(payload.dlValidity);

  return (
    <div className="w-full max-w-card overflow-hidden rounded-bubble rounded-tl border border-border-line bg-white">
      <div className="flex items-center justify-between gap-3 bg-success-soft px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <CheckIcon />
          <div className="flex min-w-0 flex-col">
            <span className="text-caption font-bold uppercase tracking-[0.3px] text-success">
              Submitted to Admin
            </span>
            <span className="truncate text-body-sm font-bold text-pine">
              {claimId}
            </span>
          </div>
        </div>
        <span className="shrink-0 rounded-pill border border-success-border bg-white px-2 py-0.5 text-caption text-success">
          Admin
        </span>
      </div>

      <div className="flex flex-col gap-3 px-4 py-4">
        <div className="flex flex-col gap-0.5">
          <p className="truncate text-body font-bold text-pine">
            {payload.driverName || "Driver"}
          </p>
          <p className="truncate type-body-secondary tracking-wide">
            Driver registration
          </p>
        </div>

        <div
          className="h-px w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, var(--color-input-border) 0 6px, transparent 6px 10px)",
          }}
        />

        <div className="flex flex-col">
          {payload.salary ? (
            <ReceiptRow label="Salary" value={payload.salary} emphasize />
          ) : null}
          {payload.dlNumber ? (
            <ReceiptRow label="DL number" value={payload.dlNumber} />
          ) : null}
          {dlValidity ? (
            <ReceiptRow label="DL validity" value={dlValidity} />
          ) : null}
          {startDate ? (
            <ReceiptRow label="Start date" value={startDate} />
          ) : null}
          {payload.vehicleClaimId ? (
            <ReceiptRow
              label="Vehicle registration"
              value={payload.vehicleClaimId}
            />
          ) : null}
          <ReceiptRow
            label="Submitted"
            value={formatSubmittedAt(submittedAt)}
          />
        </div>
      </div>
    </div>
  );
}
