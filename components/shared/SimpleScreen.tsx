"use client";

import { AppShell } from "./AppShell";
import { BackNavigationButton } from "./BackNavigationButton";

type SimpleScreenProps = {
  title: string;
  description: string;
};

export function SimpleScreen({ title, description }: SimpleScreenProps) {
  return (
    <AppShell>
      <header className="flex items-center gap-4 px-page pb-4 pt-4">
        <BackNavigationButton href="/#claims" />
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
