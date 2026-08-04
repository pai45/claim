import { colors } from "@/lib/ui/colors";

export function WalletGlyph({
  id,
  color = colors.pinePrimary,
}: {
  id: string;
  color?: string;
}) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    "aria-hidden": true as const,
  };

  if (id === "fuel") {
    return (
      <svg {...common}>
        <path
          d="M6 19V7.5A1.5 1.5 0 0 1 7.5 6h5A1.5 1.5 0 0 1 14 7.5V19M5 19h11M14 10h2.5a2 2 0 0 1 2 2v4.5a1.5 1.5 0 0 0 3 0V10.5L19 8"
          stroke={color}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (id === "reimbursement") {
    return (
      <svg {...common}>
        <path
          d="M4 12a8 8 0 1 0 2.3-5.6"
          stroke={color}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M4 4v4h4M12 8v8M10 10.5h3.2a1.6 1.6 0 0 1 0 3.2H10"
          stroke={color}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (id === "gift") {
    return (
      <svg {...common}>
        <rect x="4" y="10" width="16" height="10" rx="1.5" stroke={color} strokeWidth="1.7" />
        <path
          d="M4 13h16M12 10v10M12 10c-2.2-3.2-5.5-2.2-5.5 0C6.5 11.5 9 12 12 10Zm0 0c2.2-3.2 5.5-2.2 5.5 0C17.5 11.5 15 12 12 10Z"
          stroke={color}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path
        d="M8 4v16M8 8h3M16 4v7c0 2-1 3-2.5 3H16v6"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
