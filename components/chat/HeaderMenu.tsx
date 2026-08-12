"use client";

import Link from "next/link";
import { useCallback, useRef, type ReactNode } from "react";
import { AppIcon } from "@/components/shared/AppIcon";
import { useNotifications } from "@/features/notifications/useNotifications";
import { UI_ICONS } from "@/lib/ui/assets";
import { useModalFocus } from "@/lib/ui/useModalFocus";

type HeaderMenuProps = {
  open: boolean;
  onClose: () => void;
  onNewChat: () => void;
};

const ROW =
  "flex min-h-11 w-full items-center gap-2.5 px-3.5 py-3 text-body-sm font-bold text-cta-ink transition-colors hover:bg-surface-tint active:bg-surface-tint";

const MENU_ITEMS: {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
}[] = [
  {
    id: "dashboard",
    label: "Claims Dashboard",
    href: "/dashboard",
    icon: <AppIcon src={UI_ICONS.claimsDashboard} size={20} alt="" />,
  },
  {
    id: "policy-details",
    label: "Policy details",
    href: "/policy-details",
    icon: <AppIcon src={UI_ICONS.policyDetails} size={20} alt="" />,
  },
  {
    id: "claim-history",
    label: "Claim history",
    href: "/claims-history",
    icon: <AppIcon src={UI_ICONS.claimHistory} size={20} alt="" />,
  },
  {
    id: "notifications",
    label: "Alerts",
    href: "/notifications/",
    icon: <AppIcon src={UI_ICONS.notification} size={20} alt="" />,
  },
];

export function HeaderMenu({ open, onClose, onNewChat }: HeaderMenuProps) {
  const { count: notificationCount } = useNotifications();
  const modalRef = useRef<HTMLDivElement>(null);
  const handleClose = useCallback(() => onClose(), [onClose]);
  useModalFocus(modalRef, open, handleClose);

  return (
    <div
      ref={modalRef}
      className={`fixed inset-0 z-50 mx-auto max-w-phone overflow-hidden ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close menu"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Anchored under the 69px header (pt-3 + h-11 + pb-3 + border) */}
      <div
        role="menu"
        aria-label="Assistant menu"
        className={`absolute right-page top-[72px] w-56 origin-top-right overflow-hidden rounded-card border border-border-soft bg-white shadow-menu transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
          open
            ? "scale-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        }`}
      >
        <ul className="divide-y divide-border-soft">
          {MENU_ITEMS.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                role="menuitem"
                onClick={handleClose}
                className={ROW}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.id === "notifications" && notificationCount > 0 ? (
                  <span className="ml-auto flex min-h-6 min-w-6 items-center justify-center rounded-pill bg-mint px-1.5 text-caption font-bold text-pine-dark">
                    {notificationCount}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>

        <div className="h-1.5 bg-surface-muted" aria-hidden />

        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onNewChat();
            handleClose();
          }}
          className={`${ROW} text-pine-primary`}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center">
            <AppIcon src={UI_ICONS.plus} size={20} alt="" />
          </span>
          <span>New chat</span>
        </button>
      </div>
    </div>
  );
}
