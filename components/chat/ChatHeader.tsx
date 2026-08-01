"use client";

import { useState } from "react";
import { SideMenu } from "./SideMenu";

export function ChatHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="flex items-center gap-4 px-4 pb-4 pt-2">
        <button
          type="button"
          aria-label="Go back"
          className="flex items-center justify-center rounded-full bg-white/50 p-2 shadow-[4px_4px_12px_rgba(0,42,25,0.08)]"
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
              stroke="#1E1F24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="truncate font-display text-xl font-bold text-pine">
            Claims Assistant
          </h1>
        </div>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className="flex h-6 w-6 items-center justify-center"
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
              stroke="#0F3F37"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
