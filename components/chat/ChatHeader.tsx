"use client";

import { useState } from "react";
import { colors } from "@/lib/ui/colors";
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
        <button
          type="button"
          aria-label="Go back"
          className="flex items-center justify-center rounded-full bg-white/50 p-2 shadow-icon"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M14.5 6.5L9 12l5.5 5.5"
              stroke={colors.ink}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="type-screen-title truncate">Claims Assistant</h1>
        </div>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className="flex h-6 w-6 items-center justify-center text-pine"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
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
