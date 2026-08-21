import type { TransactionWallet } from "@/features/transactions/constants";
import { AppIcon } from "@/components/shared/AppIcon";
import { ReimbursementWalletIcon } from "@/components/shared/ReimbursementWalletIcon";
import { CATEGORY_ICONS } from "@/lib/ui/assets";

type BenefitWalletIconProps = {
  wallet: TransactionWallet;
  size?: number;
};

/** The four wallet glyphs used by the EB+ Wallets list on Benefits home. */
export function BenefitWalletIcon({
  wallet,
  size = 20,
}: BenefitWalletIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    "aria-hidden": true as const,
  };

  if (wallet === "fuel") {
    return (
      <svg {...common}>
        <path
          d="M3.5 22V5c0-2 1.34-3 3-3h8c1.66 0 3 1 3 3v17h-14ZM2 22h17"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.39 10h4.23c1.04 0 1.89-.5 1.89-1.89V6.88c0-1.39-.85-1.89-1.89-1.89H8.39c-1.04 0-1.89.5-1.89 1.89v1.23C6.5 9.5 7.35 10 8.39 10ZM6.5 13h3M17.5 16.01 22 16v-6l-2-1"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (wallet === "misc") {
    return <ReimbursementWalletIcon size={size} />;
  }

  if (wallet === "mobile") {
    return <AppIcon src={CATEGORY_ICONS.mobile} size={size} />;
  }

  if (false) {
    return (
      <svg {...common}>
        <path
          d="M12 6v16m0-16H8.464c-.52 0-1.02-.21-1.389-.586A2.019 2.019 0 0 1 6.5 4c0-.53.207-1.04.575-1.414A1.947 1.947 0 0 1 8.465 2C11.214 2 12 6 12 6Zm0 0h3.536c.52 0 1.02-.21 1.389-.586A2.02 2.02 0 0 0 17.5 4c0-.53-.207-1.04-.575-1.414A1.947 1.947 0 0 0 15.535 2C12.786 2 12 6 12 6Zm8 5v7.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C18.48 22 17.92 22 16.8 22H7.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C4 20.48 4 19.92 4 18.8V11M2 7.6v1.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C2.76 11 3.04 11 3.6 11h16.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C22 10.24 22 9.96 22 9.4V7.6c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C21.24 6 20.96 6 20.4 6H3.6c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C2 6.76 2 7.04 2 7.6Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path
        d="M17.79 10.47v7.32A4.21 4.21 0 0 1 13.58 22H6.21C3.89 22 2 20.11 2 17.79v-7.32a4.21 4.21 0 0 1 4.21-4.21h7.37c2.32 0 4.21 1.89 4.21 4.21ZM5.5 4V2.25M9.5 4V2.25M13.5 4V2.25M22 13.16c0 2.32-1.89 4.21-4.21 4.21V8.95A4.21 4.21 0 0 1 22 13.16ZM2 12h15.51"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
