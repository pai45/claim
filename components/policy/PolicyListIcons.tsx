import type { ReactNode } from "react";
import type { PolicyListIconId } from "@/features/policy/constants";

type IconProps = {
  tone: string;
};

function MealIcon({ tone }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3v10M5 3v4a2 2 0 0 0 4 0V3M17 3v18M15 3h4v5a2 2 0 0 1-4 0V3z"
        stroke={tone}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GiftIcon({ tone }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10zM3 7h18v3H3V7zM12 7v14"
        stroke={tone}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 7c-1.5-3-4-3.5-5-2s0 3.5 2.5 3.5H12M12 7c1.5-3 4-3.5 5-2s0 3.5-2.5 3.5H12"
        stroke={tone}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FuelIcon({ tone }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14H4zM15 9h2.5A2.5 2.5 0 0 1 20 11.5V16a2 2 0 1 0 4 0v-4.2L20 8"
        stroke={tone}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7 9h5" stroke={tone} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MobileIcon({ tone }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
        stroke={tone}
        strokeWidth="1.5"
      />
      <path d="M10 17h2" stroke={tone} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DriverIcon({ tone }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 16.5c1.5-3 4-5 8-5s6.5 2 8 5"
        stroke={tone}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="8" r="3" stroke={tone} strokeWidth="1.5" />
      <path
        d="M5 19h14M7 19v2M17 19v2"
        stroke={tone}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BooksIcon({ tone }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4h9a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2 2V4z"
        stroke={tone}
        strokeWidth="1.5"
      />
      <path
        d="M16 6h2a2 2 0 0 1 2 2v12h-4V6z"
        stroke={tone}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ProfessionalIcon({ tone }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 9l9-5 9 5-9 5-9-5z"
        stroke={tone}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7 11.5v4c2 1.5 8 1.5 10 0v-4M21 9v6"
        stroke={tone}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const ICONS: Record<PolicyListIconId, (props: IconProps) => ReactNode> = {
  meal: MealIcon,
  gift: GiftIcon,
  fuel: FuelIcon,
  mobile: MobileIcon,
  driver: DriverIcon,
  books: BooksIcon,
  professional: ProfessionalIcon,
};

export function PolicyListIcon({
  id,
  tone,
}: {
  id: PolicyListIconId;
  tone: string;
}) {
  const Icon = ICONS[id];
  return <>{Icon({ tone })}</>;
}
