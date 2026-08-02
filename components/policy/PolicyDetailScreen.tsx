"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  POLICY_CATEGORIES,
  type PolicyTabId,
} from "@/features/policy/constants";
import { staggerStyle } from "@/lib/ui/staggerStyle";
import {
  BackChevronIcon,
  BenefitIcon,
  CheckIcon,
  WarningIcon,
} from "./PolicyIcons";

type PolicyDetailScreenProps = {
  initialTab: PolicyTabId;
};

export function PolicyDetailScreen({ initialTab }: PolicyDetailScreenProps) {
  const router = useRouter();
  const activeTab = initialTab;
  const tabsScrollerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeTab]);

  const policy = useMemo(
    () =>
      POLICY_CATEGORIES.find((item) => item.id === activeTab) ??
      POLICY_CATEGORIES[0],
    [activeTab],
  );

  const coveredLeft = policy.covered?.slice(0, 3) ?? [];
  const coveredRight = policy.covered?.slice(3) ?? [];

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[402px] flex-col overflow-hidden bg-[#F8FAF8] shadow-[0_0_40px_rgba(0,42,25,0.08)]">
      <div className="w-full min-w-0 bg-white">
        <header className="flex items-center gap-4 px-5 pb-4 pt-2">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.push("/policy-details")}
            className="flex items-center justify-center rounded-full bg-white/50 p-2 shadow-[4px_4px_12px_rgba(0,42,25,0.08)]"
          >
            <BackChevronIcon />
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {policy.eyebrow ? (
              <p className="font-sans text-[10px] font-bold uppercase text-[#768E89]">
                {policy.eyebrow}
              </p>
            ) : null}
            <h1 className="truncate font-sans text-xl font-bold text-pine">
              {policy.title}
            </h1>
          </div>
        </header>

        <div
          ref={tabsScrollerRef}
          className="flex w-full min-w-0 snap-x snap-mandatory touch-pan-x overflow-x-auto overscroll-x-contain border-b border-[#D8DADF] bg-[#F8FAF8] px-2 pt-5 pb-0 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {POLICY_CATEGORIES.map((item) => {
            const active = item.id === activeTab;
            return (
              <button
                key={item.id}
                ref={active ? activeTabRef : undefined}
                type="button"
                onClick={() => {
                  router.replace(`/policy-details/${item.id}`, { scroll: false });
                }}
                className={`shrink-0 snap-start px-3 ${
                  active ? "pb-0 pt-2" : "h-[38px] py-2"
                }`}
              >
                {active ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="whitespace-nowrap font-sans text-[15px] font-semibold leading-5 text-[#1E1F24]">
                      {item.tabLabel}
                    </span>
                    <span className="h-0.5 w-full rounded-full bg-[#005656]" />
                  </div>
                ) : (
                  <span className="whitespace-nowrap font-sans text-[15px] font-normal leading-5 text-[#595E70]">
                    {item.tabLabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <main
        key={policy.id}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-8 pt-4"
      >
        <section
          className="animate-rise-in flex flex-col gap-2 rounded-2xl border border-[#FEF0C7] bg-[#FFFBEB] p-4"
          style={staggerStyle(0)}
        >
          <div className="flex items-center gap-1.5">
            <WarningIcon />
            <h2 className="font-sans text-xs font-bold text-[#B25E00]">
              Important Notes
            </h2>
          </div>
          <ul className="flex flex-col gap-1">
            {policy.notes.map((note, index) => (
              <li
                key={note}
                className="animate-rise-in font-sans text-[10px] font-normal leading-[14px] text-[#B25E00]"
                style={staggerStyle(index + 1)}
              >
                • {note}
              </li>
            ))}
          </ul>
        </section>

        <section className="animate-rise-in flex flex-col gap-2" style={staggerStyle(1)}>
          <h2 className="font-sans text-sm font-bold uppercase text-[#768E89]">
            {policy.whatIsHeading}
          </h2>
          <div className="rounded-2xl border border-[#E5ECE8] bg-white p-4">
            <p className="font-sans text-sm font-normal leading-[22px] text-pine">
              {policy.description}
            </p>
          </div>
        </section>

        <section className="animate-rise-in flex flex-col gap-3" style={staggerStyle(2)}>
          <h2 className="font-sans text-sm font-bold uppercase text-[#768E89]">
            Benefits & Limits
          </h2>
          <div className="flex flex-col gap-3 rounded-2xl border border-[#E5ECE8] bg-white p-4">
            {policy.benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="animate-rise-in flex flex-col gap-3"
                style={staggerStyle(index + 3)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#E8F2EE] p-2">
                    <BenefitIcon type={benefit.icon} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="font-sans text-sm font-bold text-pine">
                      {benefit.title}
                    </p>
                    <p className="font-sans text-xs font-normal text-[#2C5E56]">
                      {benefit.detail}
                    </p>
                  </div>
                </div>
                {index < policy.benefits.length - 1 ? (
                  <div className="h-px w-full bg-[#F4F7F5]" />
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {policy.covered && policy.covered.length > 0 ? (
          <section
            className="animate-rise-in flex flex-col gap-3 rounded-2xl border border-[#E5ECE8] bg-white p-4"
            style={staggerStyle(3)}
          >
            <h2 className="font-sans text-sm font-bold text-[#0F2C25]">
              What is Covered?
            </h2>
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-2.5">
                {coveredLeft.map((item, index) => (
                  <div
                    key={item}
                    className="animate-rise-in flex items-start gap-2"
                    style={staggerStyle(index + 4)}
                  >
                    <span className="mt-0.5 shrink-0">
                      <CheckIcon />
                    </span>
                    <span className="font-sans text-xs font-normal text-[#0F2C25]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-1 flex-col gap-2.5">
                {coveredRight.map((item, index) => (
                  <div
                    key={item}
                    className="animate-rise-in flex items-start gap-2"
                    style={staggerStyle(index + 4)}
                  >
                    <span className="mt-0.5 shrink-0">
                      <CheckIcon />
                    </span>
                    <span className="font-sans text-xs font-normal text-[#0F2C25]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="animate-rise-in flex flex-col gap-3" style={staggerStyle(4)}>
          <h2 className="font-sans text-sm font-bold uppercase text-[#768E89]">
            How It Works
          </h2>
          <div className="flex flex-col pl-2">
            {policy.steps.map((step, index) => {
              const isLast = index === policy.steps.length - 1;
              return (
                <div
                  key={step.title}
                  className="animate-rise-in flex items-start gap-4"
                  style={staggerStyle(index + 5)}
                >
                  <div className="flex min-h-20 w-6 flex-col items-center">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B5E4B]">
                      <span className="font-sans text-xs font-bold text-white">
                        {index + 1}
                      </span>
                    </div>
                    {!isLast ? (
                      <div className="mt-1 w-0.5 flex-1 bg-[#E8F2EE]" />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 pb-5">
                    <p className="font-sans text-base font-bold text-pine">
                      {step.title}
                    </p>
                    <p className="font-sans text-xs font-normal leading-[18px] text-[#2C5E56]">
                      {step.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
