"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import {
  EMPLOYER_BENEFITS_CATALOG,
  getEmployerBenefit,
  type PolicyTabId,
} from "@/features/policy/constants";
import { staggerStyle } from "@/lib/ui/staggerStyle";
import {
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

  return (
    <AppShell className="overflow-hidden">
      <div className="w-full min-w-0 shrink-0 bg-white">
        <ScreenHeader
          title={policy.title}
          eyebrow={policy.eyebrow}
          onBack={() => router.push("/policy-details")}
        />

        <div
          className="flex w-full min-w-0 snap-x snap-mandatory touch-pan-x overflow-x-auto overscroll-x-contain border-b border-border-tab px-2 pt-1 pb-0 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Benefit policies"
        >
          {EMPLOYER_BENEFITS_CATALOG.benefits.map((item) => {
            const active = item.id === activeTab;
            return (
              <button
                key={item.id}
                ref={active ? activeTabRef : undefined}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  router.replace(`/policy-details/${item.id}`, { scroll: false });
                }}
                className="flex min-h-11 shrink-0 snap-start items-center justify-center px-3 pt-2"
              >
                <span className="flex flex-col items-center gap-2">
                  <span
                    className={`type-body whitespace-nowrap ${
                      active
                        ? "font-bold text-ink"
                        : "font-normal text-ink-secondary"
                    }`}
                  >
                    {item.tabLabel}
                  </span>
                  <span
                    className={`h-0.5 w-full rounded-pill ${
                      active ? "bg-pine-primary" : "bg-transparent"
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <main
        key={policy.id}
        className="flex min-h-0 flex-1 flex-col gap-section overflow-y-auto px-page pb-8 pt-4"
      >
        <section
          className="animate-rise-in flex flex-col gap-2 rounded-card border border-warning-border bg-warning-soft p-card"
          style={staggerStyle(0)}
        >
          <div className="flex items-center gap-1.5">
            <WarningIcon />
            <h2 className="type-field-label text-warning">Important notes</h2>
          </div>
          <ul className="flex flex-col gap-1.5">
            {policy.notes.map((note, index) => (
              <li
                key={note}
                className="animate-rise-in type-body-secondary text-warning-ink"
                style={staggerStyle(index + 1)}
              >
                • {note}
              </li>
            ))}
          </ul>
        </section>

        <section className="animate-rise-in flex flex-col gap-2" style={staggerStyle(1)}>
          <h2 className="type-section-label">{policy.whatIsHeading}</h2>
          <div className="rounded-card border border-border-line bg-white p-card shadow-card">
            <p className="type-body-secondary">{policy.description}</p>
          </div>
        </section>

        <section className="animate-rise-in flex flex-col gap-3" style={staggerStyle(2)}>
          <h2 className="type-section-label">Benefits & Limits</h2>
          <div className="flex flex-col gap-3 rounded-card border border-border-line bg-white p-card shadow-card">
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
                    <p className="type-body font-bold text-pine">{benefit.title}</p>
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
            <p className="type-body font-bold text-pine">
              {policy.taxTreatment.label}
            </p>
            <p className="mt-1 type-body-secondary">
              {policy.taxTreatment.summary} {policy.taxTreatment.qualifier}
            </p>
            <p className="mt-1 text-caption text-ink-secondary">
              {policy.taxTreatment.disclaimer} Policy version{" "}
              {EMPLOYER_BENEFITS_CATALOG.policyVersion}.
            </p>
          </div>
        </section>

        {policy.covered && policy.covered.length > 0 ? (
          <section
            className="animate-rise-in flex flex-col gap-3 rounded-card border border-border-line bg-white p-card shadow-card"
            style={staggerStyle(3)}
          >
            <h2 className="type-section-title">What is Covered?</h2>
            <ul className="flex flex-col gap-3">
              {policy.covered.map((item, index) => (
                <li
                  key={item}
                  className="animate-rise-in flex items-start gap-2"
                  style={staggerStyle(index + 4)}
                >
                  <span className="mt-0.5 shrink-0">
                    <CheckIcon />
                  </span>
                  <span className="type-body-secondary text-ink">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="animate-rise-in flex flex-col gap-3" style={staggerStyle(4)}>
          <h2 className="type-section-label">How It Works</h2>
          <div className="flex flex-col rounded-card border border-border-line bg-white p-card shadow-card pl-3">
            {policy.steps.map((step, index) => {
              const isLast = index === policy.steps.length - 1;
              return (
                <div
                  key={step.title}
                  className="animate-rise-in flex items-start gap-3"
                  style={staggerStyle(index + 5)}
                >
                  <div className="flex min-h-20 w-6 flex-col items-center">
                    <div className="flex h-6 w-6 items-center justify-center rounded-pill bg-pine-primary">
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
