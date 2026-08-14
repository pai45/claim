type VehicleRegistrationPlateProps = {
  registrationNumber: string;
};

/** Indian vehicle registration plate shared by vehicle detail surfaces. */
export function VehicleRegistrationPlate({
  registrationNumber,
}: VehicleRegistrationPlateProps) {
  return (
    <div
      aria-label={`Vehicle registration number: ${registrationNumber}`}
      className="inline-flex min-h-11 overflow-hidden rounded-control border-2 border-border-tab bg-white"
    >
      <span className="flex w-12 shrink-0 flex-col items-center justify-center gap-0.5 bg-vehicle-plate px-2 py-1.5 text-white">
        <span aria-hidden="true" className="text-caption leading-none">
          ✦
        </span>
        <span className="text-caption font-bold leading-none tracking-wide">
          IND
        </span>
      </span>
      <span className="flex items-center px-4 py-2 font-sans text-title font-bold tracking-wider text-ink">
        {registrationNumber}
      </span>
    </div>
  );
}
