"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { POLICY_LIST_ITEMS } from "@/features/policy/constants";
import { colors } from "@/lib/ui/colors";
import { staggerStyle } from "@/lib/ui/staggerStyle";
import { BackChevronIcon } from "./PolicyIcons";
import { PolicyListIcon } from "./PolicyListIcons";

function ChevronRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9.5 6.5 15 12l-5.5 5.5"
        stroke={colors.pinePrimary}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PolicyBenefitsListScreen() {
  const router = useRouter();

  return (
    <AppShell className="overflow-hidden">
      <header className="flex items-center gap-4 bg-white px-page pb-4 pt-2">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.push("/")}
          className="flex items-center justify-center rounded-full bg-white/50 p-2 shadow-icon"
        >
          <BackChevronIcon />
        </button>
        <h1 className="type-screen-title flex-1 truncate">Policy details</h1>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-page pb-24 pt-3">
        <section className="flex flex-col gap-4">
          <h2 className="type-section-label">BENEFITS POLICY</h2>

          <ul className="flex flex-col gap-2">
            {POLICY_LIST_ITEMS.map((item, index) => (
              <li
                key={item.id}
                className="animate-rise-in"
                style={staggerStyle(index)}
              >
                <Link
                  href={`/policy-details/${item.id}`}
                  className="flex items-center gap-3 rounded-card border border-border-line bg-white px-page py-4"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control"
                    style={{ background: item.iconBg }}
                  >
                    <PolicyListIcon id={item.id} tone={item.iconTone} />
                  </div>
                  <span className="type-body min-w-0 flex-1 font-bold">{item.label}</span>
                  <ChevronRight />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </AppShell>
  );
}
