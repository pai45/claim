"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { colors } from "@/lib/ui/colors";

type SideMenuProps = {
  open: boolean;
  onClose: () => void;
  onNewChat: () => void;
};

function NewChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 4.17v11.66M4.17 10h11.66"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect
        x="2.08"
        y="2.08"
        width="6.67"
        height="6.67"
        rx="2"
        stroke={colors.pineDark}
        strokeWidth="1.5"
      />
      <rect
        x="11.25"
        y="2.08"
        width="6.67"
        height="6.67"
        rx="2"
        stroke={colors.pineDark}
        strokeWidth="1.5"
      />
      <rect
        x="2.08"
        y="11.25"
        width="6.67"
        height="6.67"
        rx="2"
        stroke={colors.pineDark}
        strokeWidth="1.5"
      />
      <rect
        x="11.25"
        y="11.25"
        width="6.67"
        height="6.67"
        rx="2"
        stroke={colors.pineDark}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function PolicyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M2.5 6.5c0-1.2.9-2.2 2.1-2.2h8.8c1.2 0 2.1 1 2.1 2.2v7.1c0 1.2-.9 2.2-2.1 2.2H4.6c-1.2 0-2.1-1-2.1-2.2V6.5z"
        stroke={colors.pinePrimary}
        strokeWidth="1.25"
      />
      <path
        d="M13.5 7.5h2.2c.7 0 1.3.6 1.3 1.3v.7c0 .7-.6 1.3-1.3 1.3H13.5"
        stroke={colors.pinePrimary}
        strokeWidth="1.25"
      />
      <circle cx="15" cy="9.8" r="0.85" fill={colors.pinePrimary} />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke={colors.pineDark} strokeWidth="1.5" />
      <path
        d="M10 6.7V10l3.3 1.7"
        stroke={colors.pineDark}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
    icon: <DashboardIcon />,
  },
  {
    id: "policy-details",
    label: "Policy details",
    href: "/policy-details",
    icon: <PolicyIcon />,
  },
  {
    id: "claim-history",
    label: "Claim history",
    href: "/claims-history",
    icon: <HistoryIcon />,
  },
];

export function SideMenu({ open, onClose, onNewChat }: SideMenuProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 mx-auto max-w-phone overflow-hidden ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <nav
        className={`absolute right-0 top-0 flex h-full w-[300px] flex-col bg-bg shadow-menu transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Main menu"
      >
        <div className="flex items-center justify-between px-5 py-5">
          <h2 className="type-screen-title">Menu</h2>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white"
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
                onClick={onClose}
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
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-control bg-pine-primary px-3.5 py-3 text-white shadow-cta transition-colors hover:bg-pine-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-primary focus-visible:ring-offset-2"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
              <NewChatIcon />
            </span>
            <span className="text-body font-bold">New chat</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
