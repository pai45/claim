"use client";

import Link from "next/link";
import { colors } from "@/lib/ui/colors";

type BackNavigationButtonProps = {
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

function BackChevronIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14.5 6.5 9 12l5.5 5.5"
        stroke={colors.pine}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const buttonClassName =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white shadow-soft";

export function BackNavigationButton({
  href,
  onClick,
  ariaLabel = "Go back",
}: BackNavigationButtonProps) {
  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={buttonClassName}>
        <BackChevronIcon />
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={buttonClassName}
    >
      <BackChevronIcon />
    </button>
  );
}
