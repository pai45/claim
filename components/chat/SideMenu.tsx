"use client";

import Link from "next/link";
import { useCallback, useRef, type ReactNode } from "react";
import { AppIcon } from "@/components/shared/AppIcon";
import { UI_ICONS } from "@/lib/ui/assets";
import { colors } from "@/lib/ui/colors";
import { useModalFocus } from "@/lib/ui/useModalFocus";

type SideMenuProps = {
  open: boolean;
  onClose: () => void;
  onNewChat: () => void;
};

function NewChatIcon() {
  return <AppIcon src={UI_ICONS.plus} size={20} alt="" className="brightness-0 invert" />;
}

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
];

export function SideMenu({ open, onClose, onNewChat }: SideMenuProps) {
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
      role="dialog"
      aria-modal="true"
      aria-labelledby="side-menu-title"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close menu"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <nav
        className={`absolute right-0 top-0 flex h-full w-75 flex-col bg-bg shadow-menu transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Main menu"
      >
        <div className="flex items-center justify-between px-5 py-5">
          <h2 id="side-menu-title" className="type-screen-title">Menu</h2>
          <button
            type="button"
            aria-label="Close menu"
            onClick={handleClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke={colors.pine}
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <ul className="flex flex-col gap-3 px-4">
          {MENU_ITEMS.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                onClick={handleClose}
                className="flex w-full items-center gap-2 rounded-control border border-border-muted bg-white px-3.5 py-3"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {item.icon}
                </span>
                <span className="text-body font-bold text-cta-ink">
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto px-4 pb-5 pt-4">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              handleClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-control bg-pine-primary px-3.5 py-3 text-white shadow-cta transition-colors hover:bg-pine-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-primary focus-visible:ring-offset-2"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
              <NewChatIcon />
            </span>
            <span className="font-bold text-white">New chat</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
