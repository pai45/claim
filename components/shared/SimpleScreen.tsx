"use client";

import Link from "next/link";
import { colors } from "@/lib/ui/colors";
import { AppShell } from "./AppShell";

type SimpleScreenProps = {
  title: string;
  description: string;
};

export function SimpleScreen({ title, description }: SimpleScreenProps) {
  return (
    <AppShell>
      <header className="flex items-center gap-4 px-page pb-4 pt-2">
        <Link
          href="/"
          aria-label="Go back"
          className="flex items-center justify-center rounded-full bg-white/50 p-2 shadow-icon"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M14.5 6.5L9 12l5.5 5.5"
              stroke={colors.ink}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <h1 className="type-screen-title truncate">{title}</h1>
      </header>

      <main className="flex flex-1 flex-col gap-3 px-page pt-2">
        <div className="rounded-bubble rounded-tl border border-border-line bg-white p-card">
          <p className="type-body-secondary">{description}</p>
        </div>
      </main>
    </AppShell>
  );
}
