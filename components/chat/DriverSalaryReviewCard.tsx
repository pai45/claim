import type { DriverSalaryPayload } from "@/features/chat/types";
import { RegistrationDeclaration } from "./RegistrationDeclaration";

type DriverSalaryReviewCardProps = {
  payload: DriverSalaryPayload;
  onSubmit: (payload: DriverSalaryPayload) => void;
  disabled?: boolean;
};

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="type-field-label shrink-0">{label}</span>
      <span className="truncate text-right text-body-sm font-bold text-pine">
        {value}
      </span>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DriverSalaryReviewCard({
  payload,
  onSubmit,
  disabled,
}: DriverSalaryReviewCardProps) {
  return (
    <div className="flex w-full max-w-card flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-bubble rounded-tl border border-border-line bg-white p-card">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-body font-bold text-pine">
            Review driver details
          </h3>
          <p className="type-body-secondary">
            Confirm details before submitting
          </p>
        </div>

        <div className="divide-y divide-border-soft rounded-control border border-border-soft px-3 py-1">
          <Row label="Driver" value={payload.driverName} />
          <Row label="DL number" value={payload.dlNumber} />
          <Row label="DL validity" value={formatDate(payload.dlValidity)} />
          <Row label="Salary" value={payload.salary} />
          <Row label="Start date" value={formatDate(payload.startDate)} />
          <Row label="Vehicle registration" value={payload.vehicleClaimId} />
        </div>

        <RegistrationDeclaration subject="driver" />
      </div>

      <button
        type="button"
        disabled={disabled || payload.submitted}
        onClick={() => onSubmit(payload)}
        className="min-h-11 rounded-pill bg-pine-primary px-4 py-2.5 text-body-sm font-bold text-white disabled:opacity-50"
      >
        {payload.submitted ? "Submitted to Admin" : "Submit to Admin"}
      </button>
    </div>
  );
}
