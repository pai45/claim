"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AppIcon } from "@/components/shared/AppIcon";
import { RegistrationStatusChip } from "@/components/shared/RegistrationStatusChip";
import type { RegistrationAction } from "@/features/chat/homeActionCards";
import { CHAT_ASSETS, UI_ICONS } from "@/lib/ui/assets";

type HomeActionCardsProps = {
  notificationCount: number;
  showNotifications: boolean;
  registration: RegistrationAction | null;
  onVehicleStart: () => void;
  onDriverStart: () => void;
  disabled?: boolean;
};

const CARD_CLASS =
  "group relative isolate flex min-h-24 w-full animate-rise-in items-center justify-between gap-2 overflow-hidden rounded-card border border-border-line bg-white/90 p-card text-left shadow-card backdrop-blur-sm transition-[border-color,background-color,transform] hover:border-input-border hover:bg-white active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-pine-primary";

type CardCornerProps = {
  children: ReactNode;
  isSplit: boolean;
};

function CardCorner({ children, isSplit }: CardCornerProps) {
  return (
    <span
      className={`absolute inset-y-0 right-0 flex shrink-0 items-center justify-end pr-card ${isSplit ? "w-20" : "w-24"}`}
    >
      <span className="relative z-10">{children}</span>
    </span>
  );
}

export function HomeActionCards({
  notificationCount,
  showNotifications,
  registration,
  onVehicleStart,
  onDriverStart,
  disabled,
}: HomeActionCardsProps) {
  const cardCount = Number(showNotifications) + Number(Boolean(registration));
  if (cardCount === 0) return null;

  const alertLabel = notificationCount === 1 ? "alert" : "alerts";
  const isSplit = cardCount === 2;
  const isDriver = registration?.kind === "driver";
  const isRejected = registration?.status === "rejected";
  const registrationTitle = isDriver
    ? "Driver Registration"
    : "Vehicle Registration";
  const registrationCopy = isRejected
    ? isDriver
      ? "Driver registration was rejected."
      : "Vehicle registration was rejected."
    : isDriver
      ? "Register your driver for tax benefits."
      : "Register your vehicle for tax benefits.";
  const registrationAsset = isDriver
    ? CHAT_ASSETS.driverRegistration
    : CHAT_ASSETS.vehicleRegistration;

  const registrationHref = isRejected ? (isDriver ? "/driver/" : "/vehicle/") : null;
  const registrationClass = `${CARD_CLASS} ${
    isRejected ? "registration-rejected-card" : "registration-pending-card"
  }`;
  const registrationStyle = {
    animationDelay: showNotifications ? "280ms" : "220ms",
  };
  const registrationBody = registration ? (
    <>
      <span
        className={`relative z-10 flex flex-col items-start gap-1.5 ${isSplit ? "max-w-24" : "min-w-0 flex-1"}`}
      >
        <RegistrationStatusChip status={registration.status} />
        <span
          className={`type-body font-bold text-ink ${isSplit ? "" : "whitespace-nowrap"}`}
        >
          {isSplit ? registrationTitle : registrationCopy}
        </span>
      </span>
      <CardCorner isSplit={isSplit}>
        <span className="flex h-12 w-12 items-center justify-center rounded-control border border-white bg-white/80 shadow-soft">
          <AppIcon
            src={registrationAsset}
            alt=""
            width={42}
            height={42}
            className="h-10 w-10 object-contain"
            priority
          />
        </span>
      </CardCorner>
    </>
  ) : null;

  return (
    <section
      aria-label="Recommended actions"
      data-walkthrough="recommended"
      className={`grid gap-3 px-page ${isSplit ? "grid-cols-2" : "grid-cols-1"}`}
    >
      {showNotifications ? (
        <Link
          href="/notifications/"
          className={CARD_CLASS}
          style={{ animationDelay: "220ms" }}
        >
          <p
            className={`relative z-10 type-body font-bold text-ink ${isSplit ? "max-w-28" : "min-w-0 flex-1"}`}
          >
            <span className="block">You have</span>
            <span className="block">
              <span className="text-warning">{notificationCount}</span> new {alertLabel}
            </span>
          </p>
          <CardCorner isSplit={isSplit}>
            <span className="relative flex h-10 w-10 items-center justify-center rounded-pill border border-white bg-white/90 shadow-soft">
              <AppIcon src={UI_ICONS.notification} size={24} alt="" />
              <span
                aria-hidden
                className="absolute right-0 top-0 h-2.5 w-2.5 rounded-pill border-2 border-white bg-danger"
              />
            </span>
          </CardCorner>
        </Link>
      ) : null}

      {registration ? (
        registrationHref ? (
          /* A rejected registration has something to explain, so it opens the
             details screen that spells out why; a pending one has nothing to
             show yet and goes straight into the assistant. */
          <Link
            href={registrationHref}
            className={registrationClass}
            style={registrationStyle}
          >
            {registrationBody}
          </Link>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={isDriver ? onDriverStart : onVehicleStart}
            className={`${registrationClass} disabled:opacity-60`}
            style={registrationStyle}
          >
            {registrationBody}
          </button>
        )
      ) : null}
    </section>
  );
}
