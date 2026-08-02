"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import {
  EMPLOYER_BENEFITS_CATALOG,
  getEmployerBenefit,
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
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    activeTabRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeTab]);

  const policy = useMemo(() => getEmployerBenefit(activeTab), [activeTab]);

  const coveredLeft = policy.covered?.slice(0, 3) ?? [];
  const coveredRight = policy.covered?.slice(3) ?? [];

  return (
    <AppShell className="overflow-hidden">
      <div className="w-full min-w-0 bg-white">
        <header className="flex items-center gap-4 px-page pb-4 pt-2">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.push("/policy-details")}
            className="flex items-center justify-center rounded-full bg-white/50 p-2 shadow-icon"
          >
            <BackChevronIcon />
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {policy.eyebrow ? (
              <p className="type-field-label">{policy.eyebrow}</p>
            ) : null}
            <h1 className="type-screen-title truncate">{policy.title}</h1>
          </div>
        </header>

        <div
          ref={tabsScrollerRef}
          className="flex w-full min-w-0 snap-x snap-mandatory touch-pan-x overflow-x-auto overscroll-x-contain border-b border-border-tab bg-surface px-2 pt-5 pb-0 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {EMPLOYER_BENEFITS_CATALOG.benefits.map((item) => {
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
                  active ? "pb-0 pt-2" : "h-10 py-2"
                }`}
              >
                {active ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="type-body whitespace-nowrap font-bold text-ink">
                      {item.tabLabel}
                    </span>
                    <span className="h-0.5 w-full rounded-full bg-pine-primary" />
                  </div>
                ) : (
                  <span className="type-body whitespace-nowrap font-normal text-ink-secondary">
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
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-page pb-8 pt-4"
      >
        <section
          className="animate-rise-in flex flex-col gap-2 rounded-card border border-warning-border bg-warning-soft p-card"
          style={staggerStyle(0)}
        >
          <div className="flex items-center gap-1.5">
            <WarningIcon />
            <h2 className="type-field-label text-warning">Important Notes</h2>
          </div>
          <ul className="flex flex-col gap-1">
            {policy.notes.map((note, index) => (
              <li
                key={note}
                className="animate-rise-in type-field-label font-normal normal-case text-warning"
                style={staggerStyle(index + 1)}
              >
                • {note}
              </li>
            ))}
          </ul>
        </section>

        <section className="animate-rise-in flex flex-col gap-2" style={staggerStyle(1)}>
          <h2 className="type-section-label">{policy.whatIsHeading}</h2>
          <div className="rounded-card border border-border-line bg-white p-card">
            <p className="type-body-secondary text-pine">{policy.description}</p>
          </div>
        </section>

        <section className="animate-rise-in flex flex-col gap-3" style={staggerStyle(2)}>
          <h2 className="type-section-label">Benefits & Limits</h2>
          <div className="flex flex-col gap-3 rounded-card border border-border-line bg-white p-card">
            {policy.benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="animate-rise-in flex flex-col gap-3"
                style={staggerStyle(index + 3)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-surface-tint-strong p-2">
                    <BenefitIcon type={benefit.icon} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="text-body-sm font-bold text-pine">{benefit.title}</p>
                    <p className="type-body-secondary">{benefit.detail}</p>
                  </div>
                </div>
                {index < policy.benefits.length - 1 ? (
                  <div className="h-px w-full bg-border-soft" />
                ) : null}
              </div>
            ))}
          </div>
          <div className="rounded-control border border-input-border bg-surface-tint px-3 py-2.5">
            <p className="text-body-sm font-bold text-pine">
              {policy.taxTreatment.label}
            </p>
            <p className="mt-1 type-body-secondary">
              {policy.taxTreatment.summary} {policy.taxTreatment.qualifier}
            </p>
            <p className="mt-1 text-caption text-ink-secondary">
              {policy.taxTreatment.disclaimer} Policy version {EMPLOYER_BENEFITS_CATALOG.policyVersion}.
            </p>
          </div>
        </section>

        {policy.covered && policy.covered.length > 0 ? (
          <section
            className="animate-rise-in flex flex-col gap-3 rounded-card border border-border-line bg-white p-card"
            style={staggerStyle(3)}
          >
            <h2 className="text-body-sm font-bold text-ink">What is Covered?</h2>
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-3">
                {coveredLeft.map((item, index) => (
                  <div
                    key={item}
                    className="animate-rise-in flex items-start gap-2"
                    style={staggerStyle(index + 4)}
                  >
                    <span className="mt-0.5 shrink-0">
                      <CheckIcon />
                    </span>
                    <span className="type-body-secondary text-ink">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-1 flex-col gap-3">
                {coveredRight.map((item, index) => (
                  <div
                    key={item}
                    className="animate-rise-in flex items-start gap-2"
                    style={staggerStyle(index + 4)}
                  >
                    <span className="mt-0.5 shrink-0">
                      <CheckIcon />
                    </span>
                    <span className="type-body-secondary text-ink">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="animate-rise-in flex flex-col gap-3" style={staggerStyle(4)}>
          <h2 className="type-section-label">How It Works</h2>
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
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pine">
                      <span className="text-caption font-bold text-white">
                        {index + 1}
                      </span>
                    </div>
                    {!isLast ? (
                      <div className="mt-1 w-0.5 flex-1 bg-surface-tint-strong" />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 pb-5">
                    <p className="type-body font-bold text-pine">{step.title}</p>
                    <p className="type-body-secondary">{step.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

