"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppIcon } from "@/components/shared/AppIcon";
import { UI_ICONS } from "@/lib/ui/assets";
import { colors } from "@/lib/ui/colors";
import { SideMenu } from "./SideMenu";

type ChatHeaderProps = {
  onNewChat: () => void;
  /** Used when the assistant is presented inside another app's modal. */
  onBack?: () => void;
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

export function ChatHeader({ onNewChat, onBack }: ChatHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <header
        className="animate-rise-in flex items-center gap-3 border-b border-white/40 bg-white/70 px-page pb-3 pt-3 backdrop-blur-xl"
        style={{ animationDelay: "0ms" }}
      >
        <button
          type="button"
          aria-label={onBack ? "Close Benefits Assistant" : "Go back"}
          onClick={() => {
            if (onBack) onBack();
            else router.back();
          }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white shadow-soft"
        >
          <BackChevronIcon />
        </button>

        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="type-screen-title truncate">Benefits Assitant</h1>
        </div>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-pine"
        >
          <AppIcon src={UI_ICONS.menu} size={24} alt="" />
        </button>
      </header>

      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNewChat={onNewChat}
      />
    </>
  );
}
