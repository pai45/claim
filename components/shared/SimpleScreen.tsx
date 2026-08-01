"use client";

import Link from "next/link";

type SimpleScreenProps = {
  title: string;
  description: string;
};

export function SimpleScreen({ title, description }: SimpleScreenProps) {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[402px] flex-col bg-bg shadow-[0_0_40px_rgba(0,42,25,0.08)]">
      <header className="flex items-center gap-4 px-4 pb-4 pt-2">
        <Link
          href="/"
          aria-label="Go back"
          className="flex items-center justify-center rounded-full bg-white/50 p-2 shadow-[4px_4px_12px_rgba(0,42,25,0.08)]"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M14.5 6.5L9 12l5.5 5.5"
              stroke="#1E1F24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <h1 className="truncate font-display text-xl font-bold text-pine">{title}</h1>
      </header>

      <main className="flex flex-1 flex-col gap-3 px-4 pt-2">
        <div className="rounded-[18px] rounded-tl border border-[#E6ECE8] bg-white p-4">
          <p className="font-sans text-sm leading-5 text-body">{description}</p>
        </div>
      </main>
    </div>
  );
}
