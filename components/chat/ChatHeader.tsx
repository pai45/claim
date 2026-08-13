"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppIcon } from "@/components/shared/AppIcon";
import { BackNavigationButton } from "@/components/shared/BackNavigationButton";
import { UI_ICONS } from "@/lib/ui/assets";
import { HeaderMenu } from "./HeaderMenu";

type ChatHeaderProps = {
  onNewChat: () => void;
  /** Used when the assistant is presented inside another app's modal. */
  onBack?: () => void;
};

export function ChatHeader({ onNewChat, onBack }: ChatHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <header
        className="animate-rise-in flex items-center gap-3 border-b border-white/40 bg-white/70 px-page pb-3 pt-4 backdrop-blur-xl"
        style={{ animationDelay: "0ms" }}
      >
        <BackNavigationButton
          ariaLabel={onBack ? "Close Benefits Assistant" : "Go back"}
          onClick={() => {
            if (onBack) onBack();
            else router.back();
          }}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="type-screen-title truncate">Benefits assistant</h1>
        </div>

        <button
          type="button"
          id="chat-header-menu-trigger"
          aria-label="Open menu"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-pine"
        >
          <AppIcon src={UI_ICONS.menu} size={24} alt="" />
        </button>
      </header>

      <HeaderMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNewChat={onNewChat}
      />
    </>
  );
}
