"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { POLICY_LIST_ITEMS } from "@/features/policy/constants";
import { staggerStyle } from "@/lib/ui/staggerStyle";
import { BackChevronIcon } from "./PolicyIcons";
import { PolicyListIcon } from "./PolicyListIcons";

function ChevronRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9.5 6.5 15 12l-5.5 5.5"
        stroke="#005656"
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
    <div className="mx-auto flex h-dvh w-full max-w-[402px] flex-col overflow-hidden bg-[#F8FAF8] shadow-[0_0_40px_rgba(0,42,25,0.08)]">
      <header className="flex items-center gap-4 bg-white px-4 pb-4 pt-2">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.push("/")}
          className="flex items-center justify-center rounded-full bg-white/50 p-2 shadow-[4px_4px_12px_rgba(0,42,25,0.08)]"
        >
          <BackChevronIcon />
        </button>
        <h1 className="flex-1 truncate font-sans text-xl font-bold text-pine">
          Policy details
        </h1>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pb-24 pt-3">
        <section className="flex flex-col gap-4">
          <h2 className="font-sans text-xs font-bold text-[#627B7D]">
            BENEFITS POLICY
          </h2>

          <ul className="flex flex-col gap-2">
            {POLICY_LIST_ITEMS.map((item, index) => (
              <li
                key={item.id}
                className="animate-rise-in"
                style={staggerStyle(index)}
              >
                <Link
                  href={`/policy-details/${item.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-4"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: item.iconBg }}
                  >
                    <PolicyListIcon id={item.id} tone={item.iconTone} />
                  </div>
                  <span className="min-w-0 flex-1 font-sans text-[15px] font-semibold leading-5 text-[#1E1F24]">
                    {item.label}
                  </span>
                  <ChevronRight />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
