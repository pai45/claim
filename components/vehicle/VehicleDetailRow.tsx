/** A label/value line in a vehicle spec list. Renders nothing without a value. */
export function VehicleDetailRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
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
