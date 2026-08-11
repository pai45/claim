import { colors } from "@/lib/ui/colors";
import { AppIcon } from "@/components/shared/AppIcon";
import { CATEGORY_ICONS } from "@/lib/ui/assets";
import type { TransactionIconId } from "@/features/transactions/constants";

type TransactionIconProps = {
  icon: TransactionIconId;
  size?: number;
};

export function TransactionIcon({ icon, size = 22 }: TransactionIconProps) {
  const stroke = colors.pinePrimary;
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    "aria-hidden": true as const,
  };

  switch (icon) {
    case "bag":
      return (
        <svg {...common}>
          <path
            d="M7 8V7a5 5 0 0 1 10 0v1"
            stroke={stroke}
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M5.5 8.5h13l-1.1 11.2a1.5 1.5 0 0 1-1.5 1.3H8.1a1.5 1.5 0 0 1-1.5-1.3L5.5 8.5Z"
            stroke={stroke}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "food":
      return (
        <svg {...common}>
          <path
            d="M8 4v7M8 11c0 2.5-1.2 4-3 5v4M8 11c0 2.5 1.2 4 3 5v4"
            stroke={stroke}
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M16 4v16M16 4c2.2 0 3.5 2.2 3.5 5S18.2 14 16 14"
            stroke={stroke}
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case "car":
      return (
        <svg {...common}>
          <path
            d="M4 14h16l-1.5-5.2A2 2 0 0 0 16.6 7H7.4a2 2 0 0 0-1.9 1.8L4 14Z"
            stroke={stroke}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M4 14v3.5h2.2M20 14v3.5h-2.2"
            stroke={stroke}
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <circle cx="7.5" cy="17.5" r="1.5" stroke={stroke} strokeWidth="1.7" />
          <circle cx="16.5" cy="17.5" r="1.5" stroke={stroke} strokeWidth="1.7" />
        </svg>
      );
    case "money":
      return (
        <svg {...common}>
          <rect
            x="3.5"
            y="6"
            width="17"
            height="12"
            rx="2"
            stroke={stroke}
            strokeWidth="1.7"
          />
          <circle cx="12" cy="12" r="2.5" stroke={stroke} strokeWidth="1.7" />
          <path
            d="M6.5 12h.01M17.5 12h.01"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "fuel":
      return (
        <svg {...common}>
          <path
            d="M6 19V7.5A1.5 1.5 0 0 1 7.5 6h5A1.5 1.5 0 0 1 14 7.5V19"
            stroke={stroke}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M5 19h11M14 10h2.5a2 2 0 0 1 2 2v4.5a1.5 1.5 0 0 0 3 0V10.5L19 8"
            stroke={stroke}
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "mobile":
      return <AppIcon src={CATEGORY_ICONS.mobile} size={size} />;
  }
}
