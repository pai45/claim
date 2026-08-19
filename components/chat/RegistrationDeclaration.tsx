type RegistrationDeclarationProps = {
  subject: "claim" | "vehicle" | "driver";
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
};

export function RegistrationDeclaration({
  checked = true,
  onChange,
  disabled,
}: RegistrationDeclarationProps) {
  const text =
    "I declare that the information provided by me is valid and true and as per the company policy";

  if (onChange) {
    return (
      <label
        className={`flex min-h-11 items-center gap-3 pt-1 ${
          disabled ? "cursor-default" : "cursor-pointer"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-checkbox border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-pine-primary ${
            checked
              ? "border-pine-primary bg-pine-primary text-white"
              : "border-input-border bg-white text-transparent"
          }`}
        >
          <CheckIcon />
        </span>
        <span className="text-caption text-ink">{text}</span>
      </label>
    );
  }

  return (
    <div className="flex items-center gap-3 pt-1">
      <span
        aria-hidden="true"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-checkbox bg-pine-primary text-white"
      >
        <CheckIcon />
      </span>
      <p className="text-caption text-ink">{text}</p>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}
