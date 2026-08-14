import type { ReactNode } from "react";

export type ScanPayIconName =
  | "arrow"
  | "bank"
  | "camera"
  | "check"
  | "close"
  | "download"
  | "food"
  | "gallery"
  | "game"
  | "grid"
  | "health"
  | "help"
  | "info"
  | "more"
  | "plane"
  | "receipt"
  | "share"
  | "torch"
  | "trading"
  | "travel"
  | "upi"
  | "wallet"
  | "walletFuel"
  | "walletGift"
  | "walletMeal"
  | "walletReimbursement"
  | "warning";

export function ScanPayIcon({
  name,
  size = 20,
  className = "",
}: {
  name: ScanPayIconName;
  size?: number;
  className?: string;
}) {
  const paths: Record<ScanPayIconName, ReactNode> = {
    arrow: <path d="m9 18 6-6-6-6" />,
    bank: <path d="M4 9h16M6 9v9m4-9v9m4-9v9m4-9v9M3 20h18M12 4l9 4H3l9-4Z" />,
    camera: <><rect x="3" y="6" width="18" height="14" rx="3" /><path d="m8 6 1.5-2h5L16 6" /><circle cx="12" cy="13" r="3.5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M5 20h14" /></>,
    food: <><path d="M4 11h16a8 8 0 0 1-16 0Z" /><path d="M8 7c0-2 2-2 2-4m4 4c0-2 2-2 2-4" /></>,
    gallery: <><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="2" /><path d="m5 18 5-5 3 3 2-2 4 4" /></>,
    game: <><path d="M7 9h10a5 5 0 0 1 4.4 7.4l-1 1.8a2 2 0 0 1-3.1.5L15 17H9l-2.3 1.7a2 2 0 0 1-3.1-.5l-1-1.8A5 5 0 0 1 7 9Z" /><path d="M7 13v4m-2-2h4m7-1h.01m3 2h.01" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    health: <><path d="M12 21s-8-4.7-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.3-8 11-8 11Z" /><path d="M12 8v6m-3-3h6" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 1 1 3.4 2.2c-.8.4-1.2 1-1.2 1.8m0 3h.01" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10h.01" /></>,
    more: <><circle cx="6" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="18" cy="12" r="1" /></>,
    plane: <path d="m3 11 18-7-7 17-3-7-8-3Zm8 3 4-4" />,
    receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6m-6 4h6m-6 4h3" /></>,
    share: <><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5m-8 7 8 5" /></>,
    torch: <><path d="M8 3h8l-1 5H9L8 3Z" /><path d="M10 8h4v7l-1 6h-2l-1-6V8Z" /></>,
    trading: <><path d="M4 19V9m5 10V5m6 14v-7m5 7V3" /><path d="m3 13 6-5 6 2 6-6" /></>,
    travel: <><path d="M3 16h18l-2 4H5l-2-4Z" /><path d="M7 16V8h10v8M9 8V5h6v3" /></>,
    upi: <path d="M5 4h6L8 20H2L5 4Zm9 0h4l4 8-8 8h-4l6-8-2-8Z" />,
    wallet: <><path d="M4 6h14a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12" /><path d="M15 10h6v5h-6a2.5 2.5 0 0 1 0-5Z" /></>,
    // The four wallet glyphs below mirror the Wallets section of the hosted
    // PlusPay home in `public/employee-benefits`, so a wallet reads the same
    // wherever it appears.
    walletFuel: <><path d="M3.5 22V5c0-2 1.34-3 3-3h8c1.66 0 3 1 3 3v17h-14ZM2 22h17" /><path d="M8.39 10h4.23c1.04 0 1.89-.5 1.89-1.89V6.88c0-1.39-.85-1.89-1.89-1.89H8.39c-1.04 0-1.89.5-1.89 1.89v1.23C6.5 9.5 7.35 10 8.39 10ZM6.5 13h3M17.5 16.01 22 16v-6l-2-1" /></>,
    walletGift: <path d="M12 6v16m0-16H8.464c-.52 0-1.02-.21-1.389-.586A2.019 2.019 0 0 1 6.5 4c0-.53.207-1.04.575-1.414A1.947 1.947 0 0 1 8.465 2C11.214 2 12 6 12 6Zm0 0h3.536c.52 0 1.02-.21 1.389-.586A2.02 2.02 0 0 0 17.5 4c0-.53-.207-1.04-.575-1.414A1.947 1.947 0 0 0 15.535 2C12.786 2 12 6 12 6Zm8 5v7.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C18.48 22 17.92 22 16.8 22H7.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C4 20.48 4 19.92 4 18.8V11M2 7.6v1.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C2.76 11 3.04 11 3.6 11h16.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C22 10.24 22 9.96 22 9.4V7.6c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C21.24 6 20.96 6 20.4 6H3.6c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C2 6.76 2 7.04 2 7.6Z" />,
    walletMeal: <path d="M17.79 10.47v7.32A4.21 4.21 0 0 1 13.58 22H6.21C3.89 22 2 20.11 2 17.79v-7.32a4.21 4.21 0 0 1 4.21-4.21h7.37c2.32 0 4.21 1.89 4.21 4.21ZM5.5 4V2.25M9.5 4V2.25M13.5 4V2.25M22 13.16c0 2.32-1.89 4.21-4.21 4.21V8.95A4.21 4.21 0 0 1 22 13.16ZM2 12h15.51" />,
    walletReimbursement: <><path d="M4 10C4 6.229 4 4.343 5.172 3.172 6.343 2 8.229 2 12 2s5.657 0 6.828 1.172C20 4.343 20 6.229 20 10v4c0 3.771 0 5.657-1.172 6.828C17.657 22 15.771 22 12 22s-5.657 0-6.828-1.172C4 19.657 4 17.771 4 14v-4Z" /><path d="M15 18H9" /></>,
    warning: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6m0 4h.01" /></>,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
