"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ChevronRightIcon } from "@/components/shared/ChevronRightIcon";
import { AppIcon } from "@/components/shared/AppIcon";
import { ProfileDetailsScreen } from "@/components/profile/ProfileDetailsScreen";
import {
  clearMpin,
  clearMpinLock,
  clearMpinUnlock,
} from "@/features/auth/mpinStorage";
import { clearAuthSession } from "@/features/auth/session";
import { clearChatSession } from "@/features/chat/persistence";
import { resetDemoJourney } from "@/features/demo/reset";
import { useActivePersona } from "@/features/persona/useActivePersona";
import type { PersonaId } from "@/features/persona/types";
import {
  PROFILE_MENU_ITEMS,
  type ProfileMenuId,
} from "@/features/profile/constants";
import { clearRegisteredVehicle } from "@/features/vehicle/registration";
import { colors } from "@/lib/ui/colors";
import { PROFILE_ICONS } from "@/lib/ui/assets";
import { staggerStyle } from "@/lib/ui/staggerStyle";

export function ProfileScreen() {
  const router = useRouter();
  const { persona } = useActivePersona();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [profileDetailsOpen, setProfileDetailsOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function handleMenu(id: ProfileMenuId) {
    if (id === "logout") {
      setLogoutOpen(true);
      return;
    }
    if (id === "profile") {
      setProfileDetailsOpen(true);
      return;
    }
    const labels: Record<Exclude<ProfileMenuId, "logout" | "profile">, string> = {
      autopay: "AutoPay settings coming soon",
      collect: "Collect requests coming soon",
    };
    setNotice(labels[id]);
  }

  function confirmLogout() {
    setLogoutOpen(false);
    clearChatSession();
    clearRegisteredVehicle();
    clearAuthSession();
    clearMpin();
    clearMpinLock();
    clearMpinUnlock();
    router.push("/");
  }

  function confirmDemoReset(targetPersona: PersonaId) {
    setLogoutOpen(false);
    resetDemoJourney(targetPersona);
    router.push("/");
  }

  if (profileDetailsOpen) {
    return <ProfileDetailsScreen onBack={() => setProfileDetailsOpen(false)} />;
  }

  return (
    <AppShell className="overflow-hidden">
      <ScreenHeader title="Profile" onBack={() => router.push("/")} />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-8 pt-2">
        <section
          className="animate-rise-in flex flex-col items-center gap-2 pb-6 pt-2"
          style={staggerStyle(0)}
        >
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full shadow-soft font-bold text-3xl text-white"
            style={{
              background: `linear-gradient(180deg, ${colors.pinePrimary} 0%, ${colors.pine} 55%, ${colors.mint} 160%)`,
            }}
            aria-hidden="true"
          >
            {persona.profile.initials}
          </div>
          <h2 className="type-section-title mt-2 text-center text-ink">
            {persona.profile.name}
          </h2>
          <p className="text-xs text-subtle text-center">
            {persona.profile.email} • {persona.profile.employeeId}
          </p>
          <p className="type-body-secondary text-center text-xs">
            {persona.profile.memberSince}
          </p>
          <div className="mt-1 inline-flex items-center gap-1.5 rounded-pill bg-surface-muted px-3 py-1 text-xs font-semibold text-subtle border border-border-line">
            <span className="h-2 w-2 rounded-full bg-pine" />
            Active Persona: {persona.label}
          </div>
        </section>

        {notice ? (
          <p
            role="status"
            className="mb-3 rounded-control bg-success-soft px-3 py-2 text-center text-caption font-bold text-success"
          >
            {notice}
          </p>
        ) : null}

        <nav className="flex flex-col gap-3" aria-label="Profile menu">
          {PROFILE_MENU_ITEMS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleMenu(item.id)}
              style={staggerStyle(index + 1)}
              className="animate-rise-in flex min-h-14 w-full items-center gap-3 rounded-card border border-border-line bg-white p-card text-left shadow-card transition-colors hover:bg-surface"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-control ${item.iconBg}`}
              >
                <MenuIcon id={item.id} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="type-body block font-bold text-ink">
                  {item.title}
                </span>
                {item.subtitle ? (
                  <span className="type-body-secondary mt-0.5 block">
                    {item.subtitle}
                  </span>
                ) : null}
              </span>
              {item.showChevron ? (
                <span className="shrink-0 text-pine-primary opacity-70">
                  <ChevronRightIcon />
                </span>
              ) : null}
            </button>
          ))}
        </nav>
      </main>

      <ConfirmDialog
        open={logoutOpen}
        title="Log out?"
        description="You will return to the login screen. Your current onboarding is saved, so signing back in takes you straight to home."
        confirmLabel="Logout"
        cancelLabel="Stay signed in"
        extraActions={[
          {
            label: "Restart as Brand New User (Aarav)",
            hint: "Fresh start: 0 claims, 0 txns, 100% full wallet funds, no setup done.",
            tone: "danger",
            onSelect: () => confirmDemoReset("new_user"),
          },
          {
            label: "Restart as Returning User (Vishal)",
            hint: "Established user: Active claims, transactions, limits used & setup done.",
            tone: "brand",
            onSelect: () => confirmDemoReset("returning"),
          },
        ]}
        onConfirm={confirmLogout}
        onClose={() => setLogoutOpen(false)}
      />
    </AppShell>
  );
}

function MenuIcon({ id }: { id: ProfileMenuId }) {
  if (id === "profile") {
    return <AppIcon src={PROFILE_ICONS.user} size={20} alt="" />;
  }

  if (id === "autopay") {
    return <AppIcon src={PROFILE_ICONS.autopay} size={22} alt="" />;
  }

  if (id === "collect") {
    return <AppIcon src={PROFILE_ICONS.collect} size={20} alt="" />;
  }

  const stroke =
    id === "logout" ? colors.subtle : colors.pinePrimary;

  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    "aria-hidden": true as const,
  };

  return (
    <svg {...common}>
      <path
        d="M10 7H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1"
        stroke={stroke}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M15 12h6m0 0-2.5-2.5M21 12l-2.5 2.5M10 12H7"
        stroke={stroke}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
