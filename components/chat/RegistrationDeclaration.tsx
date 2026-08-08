type RegistrationDeclarationProps = {
  subject: "vehicle" | "driver";
};

export function RegistrationDeclaration({
  subject,
}: RegistrationDeclarationProps) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-pine-primary text-white"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 12 4 4L19 6" />
        </svg>
      </span>
      <p className="type-body">
        I declare that the {subject} details provided are correct and valid.
      </p>
    </div>
  );
}
