"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CategoryIcon } from "@/components/claims-history/CategoryIcon";
import { AppShell } from "@/components/shared/AppShell";
import { BackNavigationButton } from "@/components/shared/BackNavigationButton";
import { NativeMonthPicker } from "@/components/shared/NativeMonthPicker";
import {
  DRIVER_REGISTRATION_INTENT,
  DRIVER_REGISTRATION_LABEL,
  VEHICLE_REGISTRATION_INTENT,
  VEHICLE_REGISTRATION_LABEL,
} from "@/features/chat/constants";
import { setPendingChatIntent } from "@/features/chat/pendingIntent";
import { useRegisteredDriver } from "@/features/driver/useRegisteredDriver";
import {
  applyBenefitClaimOverrides,
  BENEFIT_DASHBOARD_FY_LABEL,
  getBenefitClaimsDashboard,
  selectBenefitClaimsMonth,
  statusStyles,
  type BenefitClaimStatus,
  type BenefitClaimsDashboard,
} from "@/features/dashboard/benefitClaims";
import { useClaimOverrides } from "@/features/claims/useClaimStore";
import {
  DASHBOARD_CATEGORIES,
  formatINR,
} from "@/features/dashboard/constants";
import { useActivePersona } from "@/features/persona/useActivePersona";
import { useRegisteredVehicle } from "@/features/vehicle/useRegisteredVehicle";
import type { CategoryIconId } from "@/lib/ui/assets";
import { colors } from "@/lib/ui/colors";
import { staggerStyle } from "@/lib/ui/staggerStyle";
import { VehicleRegistrationPrompt } from "./VehicleRegistrationPrompt";
import { VehicleSummaryCard } from "./VehicleSummaryCard";
import { DriverRegistrationPrompt } from "./DriverRegistrationPrompt";
import { DriverSummaryCard } from "./DriverSummaryCard";

type BenefitClaimsScreenProps = {
  categoryId: string;
};

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke={colors.ink}
        strokeWidth="1.5"
      />
      <path
        d="M3 10h18"
        stroke={colors.ink}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 3v4M16 3v4"
        stroke={colors.ink}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatusBadge({ status }: { status: BenefitClaimStatus }) {
  const styles = statusStyles(status);

  return (
    <span
      className="inline-flex min-h-6 min-w-6 items-center rounded-full px-2 py-0.5"
      style={{
        background: styles.bg,
        boxShadow: `inset 0 0 0 1px ${styles.border}`,
      }}
    >
      <span
        className="text-center text-caption font-normal leading-4"
        style={{ color: styles.text }}
      >
        {status}
      </span>
    </span>
  );
}

export function BenefitClaimsScreen({ categoryId }: BenefitClaimsScreenProps) {
  const router = useRouter();
  const { personaId } = useActivePersona();
  const { vehicle, isHydrated } = useRegisteredVehicle();
  const { driver, isHydrated: isDriverHydrated } = useRegisteredDriver();
  const claimOverrides = useClaimOverrides();
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const [selectedMonth, setSelectedMonth] = useState("2026-07");
  const allData = applyBenefitClaimOverrides(
    getBenefitClaimsDashboard(categoryId, personaId),
    claimOverrides,
  );
  const data = selectBenefitClaimsMonth(allData, selectedMonth);
  const categoryMeta =
    DASHBOARD_CATEGORIES.find((item) => item.id === data.categoryId) ??
    DASHBOARD_CATEGORIES[0];

  // The resolved id, not the raw prop — an unknown category falls back to a
  // real dashboard and must not be gated by whether a vehicle exists.
  const isFuel = data.categoryId === "fuel";

  const progressPercent = Math.min(
    100,
    data.accrued > 0 ? (data.utilized / data.accrued) * 100 : 0,
  );

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    activeTabRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [data.categoryId]);

  function startVehicleRegistration() {
    setPendingChatIntent({
      intentId: VEHICLE_REGISTRATION_INTENT,
      label: VEHICLE_REGISTRATION_LABEL,
    });
    router.push("/#claims");
  }

  function startDriverRegistration() {
    setPendingChatIntent({
      intentId: DRIVER_REGISTRATION_INTENT,
      label: DRIVER_REGISTRATION_LABEL,
    });
    router.push("/#claims");
  }

  return (
    <AppShell className="overflow-hidden">
      <div className="w-full min-w-0 shrink-0 bg-white">
        <header className="flex items-center gap-4 px-page pb-4 pt-2">
          <BackNavigationButton onClick={() => router.push("/dashboard/")} />
          <h1 className="type-screen-title flex-1 truncate">{data.title}</h1>
        </header>

        <div
          className="flex w-full min-w-0 snap-x snap-mandatory touch-pan-x overflow-x-auto overscroll-x-contain border-b border-border-tab px-2 pb-0 pt-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Benefit claim categories"
        >
          {DASHBOARD_CATEGORIES.map((category) => {
            const active = category.id === data.categoryId;
            return (
              <button
                key={category.id}
                ref={active ? activeTabRef : undefined}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  router.replace(`/dashboard/${category.id}/`, {
                    scroll: false,
                  });
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
                    {category.name}
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

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-page pb-10 pt-4">
        <section className="animate-rise-in relative flex flex-col gap-5 rounded-card border border-success bg-linear-to-b from-white to-success-tint p-card shadow-soft">
          <div className="absolute right-3 top-2.5">
            <span className="inline-flex min-h-6 min-w-6 items-center rounded-full bg-surface px-1.5 py-0.5 shadow-[inset_0_0_0_1px_var(--color-border-muted)]">
              <span className="type-field-label text-center normal-case">
                {data.frequencyLabel}
              </span>
            </span>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <CategoryIcon icon={categoryMeta.icon} color={colors.pine} />
              <p className="type-field-label tracking-wide">AVAILABLE LIMIT</p>
            </div>
            <p className="type-amount">{formatINR(data.availableLimit)}</p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <div className="h-2 w-full overflow-hidden rounded bg-border-muted">
              <div
                className="h-full rounded bg-success"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-caption text-ink-secondary">
                  Utilized for {BENEFIT_DASHBOARD_FY_LABEL}:
                </span>
                <span className="text-body-sm font-bold text-ink">
                  {formatINR(data.utilized)}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-caption text-ink-secondary">
                  Accrued for {BENEFIT_DASHBOARD_FY_LABEL}:
                </span>
                <span className="text-body-sm font-bold text-success">
                  {formatINR(data.accrued)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {isFuel ? (
          !isHydrated ? (
            // Registration is only readable on the client, so both branches
            // would flash the wrong one for a frame. Reserve the space instead.
            <div
              className="h-40 rounded-card border border-border-line bg-white/60"
              aria-hidden
            />
          ) : !vehicle ? (
            <VehicleRegistrationPrompt onRegister={startVehicleRegistration} />
          ) : (
            <>
              <VehicleSummaryCard lookup={vehicle.lookup} />
              <MonthSummary
                data={data}
                icon={categoryMeta.icon}
                staggerIndex={2}
                selectedMonth={selectedMonth}
                onSelectMonth={setSelectedMonth}
              />
            </>
          )
        ) : data.categoryId === "driver" ? (
          !isHydrated || !isDriverHydrated ? (
            <div
              className="h-40 rounded-card border border-border-line bg-white/60"
              aria-hidden
            />
          ) : !vehicle || !driver ? (
            <DriverRegistrationPrompt
              vehicleRegistered={Boolean(vehicle)}
              onRegisterVehicle={startVehicleRegistration}
              onRegisterDriver={startDriverRegistration}
            />
          ) : (
            <>
              <DriverSummaryCard driver={driver} />
              <MonthSummary
                data={data}
                icon={categoryMeta.icon}
                staggerIndex={2}
                selectedMonth={selectedMonth}
                onSelectMonth={setSelectedMonth}
              />
            </>
          )
        ) : (
          <MonthSummary
            data={data}
            icon={categoryMeta.icon}
            staggerIndex={1}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
          />
        )}
      </main>
    </AppShell>
  );
}

type MonthSummaryProps = {
  data: BenefitClaimsDashboard;
  icon: CategoryIconId;
  staggerIndex: number;
  selectedMonth: string;
  onSelectMonth: (monthKey: string) => void;
};

function MonthSummary({
  data,
  icon,
  staggerIndex,
  selectedMonth,
  onSelectMonth,
}: MonthSummaryProps) {
  return (
    <section
      className="animate-rise-in flex flex-col"
      style={staggerStyle(staggerIndex)}
    >
      <div className="flex flex-col gap-3 rounded-t-bubble border border-border-line bg-white p-card">
        <div className="flex items-center justify-between gap-3">
          <h2 className="type-body font-bold text-ink">{data.monthLabel}</h2>
          <NativeMonthPicker
            value={selectedMonth}
            onChange={onSelectMonth}
            label={`Choose claim month, currently ${data.monthLabel}. Available from April to August 2026.`}
          >
            <CalendarIcon />
          </NativeMonthPicker>
        </div>

        <div className="flex gap-2">
          <div className="flex flex-1 flex-col gap-1 rounded-control bg-surface p-3">
            <span className="type-field-label">Total Claims</span>
            <span className="text-body font-bold text-ink">
              {formatINR(data.monthTotal)}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-1 rounded-control bg-success-soft p-3">
            <span className="type-field-label text-success">Approved</span>
            <span className="text-body font-bold text-success">
              {formatINR(data.monthApproved)}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-1 rounded-control bg-warning-soft p-3">
            <span className="type-field-label text-warning">Pending</span>
            <span className="text-body font-bold text-warning">
              {formatINR(data.monthPending)}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-b-card border border-t-0 border-border-line bg-white">
        {data.claims.length === 0 ? (
          <p className="type-body-secondary px-page py-6 text-center">
            No claims submitted in {data.monthLabel}.
          </p>
        ) : data.claims.map((claim, index) => (
          <Link
            key={claim.id}
            href={`/claim-details/?id=${encodeURIComponent(claim.id)}&from=dashboard`}
            style={staggerStyle(index + staggerIndex + 1)}
            className="animate-rise-in flex w-full items-start gap-3 border-b border-border-line px-page py-3 last:border-b-0"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface-tint-strong">
              <CategoryIcon icon={icon} color={colors.pinePrimary} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="type-body font-bold">{claim.title}</span>
              <span className="type-body-secondary">{claim.category}</span>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-title-sm font-bold text-ink">
                {formatINR(claim.amount)}
              </span>
              <span className="type-body-secondary">{claim.date}</span>
              <StatusBadge status={claim.status} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

