"use client";

import { useState } from "react";
import { AppIcon } from "@/components/shared/AppIcon";
import { UI_ICONS } from "@/lib/ui/assets";
import { SideMenu } from "./SideMenu";

type ChatHeaderProps = {
  onNewChat: () => void;
};

export function ChatHeader({ onNewChat }: ChatHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        className="animate-rise-in flex items-center gap-4 px-page pb-4 pt-2"
        style={{ animationDelay: "0ms" }}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="type-screen-title truncate">Claims Assistant</h1>
        </div>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-pine"
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
