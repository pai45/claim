import type { DriverSalaryPayload } from "@/features/chat/types";

type DriverSalaryReviewCardProps = {
  payload: DriverSalaryPayload;
  onSubmit: (payload: DriverSalaryPayload) => void;
  disabled?: boolean;
};

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="shrink-0 font-sans text-[10px] font-bold uppercase tracking-wide text-[#768783]">
        {label}
      </span>
      <span className="truncate text-right font-sans text-sm font-bold text-pine">
        {value}
      </span>
    </div>
  );
}

function formatStartDate(value?: string) {
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
    <div className="flex w-full max-w-[340px] flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-[18px] rounded-tl border border-[#E6ECE8] bg-white p-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-sans text-base font-bold text-pine">
            Review driver salary
          </h3>
          <p className="font-sans text-xs font-medium text-[#768783]">
            Confirm details before submitting
          </p>
        </div>

        <div className="divide-y divide-[#EDF2EE] rounded-xl border border-[#EDF2EE] px-3 py-1">
          <Row label="Driver" value={payload.driverName} />
          <Row label="DL number" value={payload.dlNumber} />
          <Row label="Salary" value={payload.salary} />
          <Row label="Start date" value={formatStartDate(payload.startDate)} />
          <Row label="Vehicle claim" value={payload.vehicleClaimId} />
        </div>
      </div>

      <button
        type="button"
        disabled={disabled || payload.submitted}
        onClick={() => onSubmit(payload)}
        className="rounded-full bg-pine-primary px-4 py-2.5 font-sans text-sm font-bold text-white disabled:opacity-50"
      >
        {payload.submitted ? "Submitted" : "Submit claim"}
      </button>
    </div>
  );
}
