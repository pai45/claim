import type { VehicleLookup, VehicleOwnership } from "@/lib/vehicle/types";
import { vehicleDisplayName } from "@/lib/vehicle/roster";
import { colors } from "@/lib/ui/colors";
import { vehicleOwnershipLabel } from "@/lib/vehicle/ownership";

type VehicleClaimReceiptCardProps = {
  claimId: string;
  lookup: VehicleLookup;
  ownership?: VehicleOwnership;
  submittedAt: number;
};

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
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
      <span className="shrink-0 text-caption text-ink-secondary">
        {label}
      </span>
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

export function VehicleClaimReceiptCard({
  claimId,
  lookup,
  ownership,
  submittedAt,
}: VehicleClaimReceiptCardProps) {
  const name = vehicleDisplayName(lookup.profile);
  const rto = lookup.location
    ? lookup.location.officeKnown
      ? `${lookup.location.office}, ${lookup.location.stateName}`
      : lookup.location.stateName
    : "";

  return (
    <div className="w-full max-w-card overflow-hidden rounded-bubble rounded-tl border border-border-line bg-white">
      <div className="flex items-center justify-between gap-3 bg-success-soft px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <CheckIcon />
          <div className="flex min-w-0 flex-col">
            <span className="text-caption font-bold uppercase tracking-[0.3px] text-success">
              Submitted to HR
            </span>
            <span className="truncate text-body-sm font-bold text-pine">
              {claimId}
            </span>
          </div>
        </div>
        <span className="shrink-0 rounded-pill border border-success-border bg-white px-2 py-0.5 text-caption text-success">
          With HR
        </span>
      </div>

      <div className="flex flex-col gap-3 px-4 py-4">
        <div className="flex flex-col gap-0.5">
          <p className="truncate text-body font-bold text-pine">
            {name}
          </p>
          <p className="truncate type-body-secondary tracking-wide">
            Vehicle registration
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
          <ReceiptRow
            label="Reg. no."
            value={lookup.regNumber.formatted}
            emphasize
          />
          {ownership ? (
            <ReceiptRow
              label="Ownership"
              value={vehicleOwnershipLabel(ownership)}
            />
          ) : null}
          <ReceiptRow label="Owner" value={lookup.ownerName} />
          {lookup.registrationDate ? (
            <ReceiptRow label="Registered" value={lookup.registrationDate} />
          ) : null}
          {lookup.profile.fuel ? (
            <ReceiptRow label="Fuel" value={lookup.profile.fuel} />
          ) : null}
          {rto ? <ReceiptRow label="RTO" value={rto} /> : null}
          <ReceiptRow
            label="Submitted"
            value={formatSubmittedAt(submittedAt)}
          />
        </div>
      </div>
    </div>
  );
}
