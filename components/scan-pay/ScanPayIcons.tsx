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
  | "gift"
  | "grid"
  | "health"
  | "help"
  | "more"
  | "plane"
  | "receipt"
  | "share"
  | "torch"
  | "trading"
  | "travel"
  | "upi"
  | "wallet"
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
    gift: <><rect x="3" y="9" width="18" height="12" rx="2" /><path d="M12 9v12M3 13h18M7.5 9C5 9 4 7.5 4 6.2 4 4.9 5 4 6.2 4 8.5 4 12 9 12 9m4.5 0C19 9 20 7.5 20 6.2 20 4.9 19 4 17.8 4 15.5 4 12 9 12 9" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    health: <><path d="M12 21s-8-4.7-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.3-8 11-8 11Z" /><path d="M12 8v6m-3-3h6" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 1 1 3.4 2.2c-.8.4-1.2 1-1.2 1.8m0 3h.01" /></>,
    more: <><circle cx="6" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="18" cy="12" r="1" /></>,
    plane: <path d="m3 11 18-7-7 17-3-7-8-3Zm8 3 4-4" />,
    receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6m-6 4h6m-6 4h3" /></>,
    share: <><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5m-8 7 8 5" /></>,
    torch: <><path d="M8 3h8l-1 5H9L8 3Z" /><path d="M10 8h4v7l-1 6h-2l-1-6V8Z" /></>,
    trading: <><path d="M4 19V9m5 10V5m6 14v-7m5 7V3" /><path d="m3 13 6-5 6 2 6-6" /></>,
    travel: <><path d="M3 16h18l-2 4H5l-2-4Z" /><path d="M7 16V8h10v8M9 8V5h6v3" /></>,
    upi: <path d="M5 4h6L8 20H2L5 4Zm9 0h4l4 8-8 8h-4l6-8-2-8Z" />,
    wallet: <><path d="M4 6h14a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12" /><path d="M15 10h6v5h-6a2.5 2.5 0 0 1 0-5Z" /></>,
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
