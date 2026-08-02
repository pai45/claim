import { colors } from "@/lib/ui/colors";

type IconProps = {
  className?: string;
};

export function BackChevronIcon({ className }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M14.5 6.5 9 12l5.5 5.5"
        stroke={colors.ink}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8.2 6.2 11.2 13 4.5"
        stroke={colors.pine}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke={colors.warning} strokeWidth="1.6" />
      <path
        d="M8 4.8v4"
        stroke={colors.warning}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.2" r="0.8" fill={colors.warning} />
    </svg>
  );
}

export function BenefitIcon({
  type,
}: {
  type: "tax" | "limit" | "proof" | "frequency";
}) {
  if (type === "tax") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="6.5" stroke={colors.pine} strokeWidth="1.6" />
        <path
          d="M7.5 10.5 9.2 12.2 12.8 8"
          stroke={colors.pine}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "limit") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect
          x="3"
          y="4.5"
          width="14"
          height="11"
          rx="2"
          stroke={colors.pine}
          strokeWidth="1.6"
        />
        <path
          d="M6 9h8M6 12h5"
          stroke={colors.pine}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "proof") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M6 2.5h5.5L15 6v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1z"
          stroke={colors.pine}
          strokeWidth="1.6"
        />
        <path d="M11.5 2.5V6H15" stroke={colors.pine} strokeWidth="1.6" />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="6.5" stroke={colors.pine} strokeWidth="1.6" />
      <path
        d="M10 6.8V10l2.8 1.5"
        stroke={colors.pine}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
