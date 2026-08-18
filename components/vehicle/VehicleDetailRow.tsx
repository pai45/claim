/** A label/value line in a vehicle spec list. Renders nothing without a value. */
export function VehicleDetailRow({
  label,
  value,
  tone = "default",
  note,
}: {
  label: string;
  value?: string;
  /** "danger" marks a value HR took issue with, e.g. a mismatched owner name. */
  tone?: "default" | "danger";
  /** A second line under the value, used to show what the value should match. */
  note?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="type-field-label shrink-0">{label}</span>
      <span className="flex min-w-0 flex-col items-end">
        <span
          className={`truncate text-right text-body-sm font-bold ${
            tone === "danger" ? "text-danger" : "text-pine"
          }`}
        >
          {value}
        </span>
        {note ? (
          <span className="truncate text-right text-caption text-ink-secondary">
            {note}
          </span>
        ) : null}
      </span>
    </div>
  );
}
