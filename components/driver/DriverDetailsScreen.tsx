"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CategoryIcon } from "@/components/claims-history/CategoryIcon";
import { ScanPayIcon } from "@/components/scan-pay/ScanPayIcons";
import { AppShell } from "@/components/shared/AppShell";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import {
  DRIVER_REGISTRATION_INTENT,
  DRIVER_REGISTRATION_LABEL,
} from "@/features/chat/constants";
import { setPendingChatIntent } from "@/features/chat/pendingIntent";
import { useRegistrationStatus } from "@/features/chat/useRegistrationStatus";
import { DRIVER_REJECTION_REASON } from "@/features/driver/rejection";
import { useRegisteredDriver } from "@/features/driver/useRegisteredDriver";

function formatDate(value?: string): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function DriverDetailRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value?: string;
  /** "danger" marks a value HR took issue with, e.g. an unverified licence. */
  tone?: "default" | "danger";
}) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="type-field-label shrink-0">{label}</span>
      <span
        className={`truncate text-right text-body-sm font-bold ${
          tone === "danger" ? "text-danger" : "text-pine"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function DriverDetailsScreen() {
  const router = useRouter();
  const { driver, isHydrated } = useRegisteredDriver();
  const { isDriverRejected } = useRegistrationStatus();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function startRegistration() {
    setPendingChatIntent({
      intentId: DRIVER_REGISTRATION_INTENT,
      label: DRIVER_REGISTRATION_LABEL,
    });
    router.push("/#claims");
  }

  function handleReplace() {
    setConfirmOpen(false);
    // Saving a new registration replaces the stored record. Keeping the
    // current driver until then lets people safely abandon the chat flow.
    startRegistration();
  }

  return (
    <AppShell className="overflow-hidden">
      <ScreenHeader
        title="Driver Details"
        onBack={() => router.push("/dashboard/driver/")}
      />

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-page pb-10 pt-2">
        {!isHydrated ? (
          <p className="type-body-secondary">Loading driver…</p>
        ) : !driver ? (
          <section className="animate-rise-in flex flex-col gap-4 rounded-card border border-border-line bg-white p-card shadow-card">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-surface-tint-strong">
                <CategoryIcon icon="driver" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h2 className="type-section-title">No driver registered</h2>
                <p className="type-body-secondary">
                  Register your driver to claim driver salary benefits.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={startRegistration}
              className="btn-primary min-h-11 h-auto py-3"
            >
              Register driver
            </button>
          </section>
        ) : (
          <>
            {/* Same alert card the vehicle screen raises for a rejected
                registration — one status reads the same wherever it surfaces. */}
            {isDriverRejected ? (
              <div
                role="alert"
                className="animate-rise-in flex items-start gap-3 rounded-card border border-danger bg-danger-soft p-card text-danger shadow-card"
              >
                <ScanPayIcon name="warning" className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-body-sm font-bold">
                    Driver registration rejected
                  </p>
                  <p className="mt-0.5 text-caption">{DRIVER_REJECTION_REASON}</p>
                </div>
              </div>
            ) : null}

            <section className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="type-section-title truncate">{driver.driverName}</h2>
              </div>
            </section>

            {!isDriverRejected && driver.dlNumber ? (
              <span
                className={`w-fit rounded-pill px-3 py-1.5 text-body-sm font-bold tracking-wider ${
                  isDriverRejected
                    ? "bg-danger-soft text-danger"
                    : "bg-surface-tint-strong text-pine"
                }`}
              >
                {driver.dlNumber}
              </span>
            ) : null}

            <section className="divide-y divide-border-soft rounded-card border border-border-line bg-white px-card py-1 shadow-card">
              <DriverDetailRow label="Driver name" value={driver.driverName} />
              <DriverDetailRow
                label="DL number"
                value={driver.dlNumber}
                tone={isDriverRejected ? "danger" : "default"}
              />
              <DriverDetailRow
                label="DL validity"
                value={formatDate(driver.dlValidity)}
              />
              <DriverDetailRow label="Monthly salary" value={driver.salary} />
              <DriverDetailRow
                label="Start date"
                value={formatDate(driver.startDate)}
              />
            </section>

            <div className="flex justify-end">
              {/* A rejection is something to fix, not a replacement to warn
                  about, so resubmitting skips the confirm dialog. */}
              <button
                type="button"
                onClick={
                  isDriverRejected ? startRegistration : () => setConfirmOpen(true)
                }
                className={`min-h-11 shrink-0 rounded-pill border px-3.5 py-2 text-caption font-bold ${
                  isDriverRejected
                    ? "border-danger text-danger"
                    : "border-pine-primary text-pine-primary"
                }`}
              >
                {isDriverRejected ? "Resubmit Driver" : "Change Driver"}
              </button>
            </div>
          </>
        )}
      </main>

      <ConfirmDialog
        open={confirmOpen}
        title="Replace your registered driver?"
        description="You'll enter new driver details in the assistant. Your current driver stays registered until the new one is submitted."
        confirmLabel="Replace driver"
        cancelLabel="Keep current driver"
        onConfirm={handleReplace}
        onClose={() => setConfirmOpen(false)}
      />
    </AppShell>
  );
}
