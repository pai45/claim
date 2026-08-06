"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ChevronRightIcon } from "@/components/shared/ChevronRightIcon";
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

      {/* Profile Details Dialog */}
      {profileDetailsOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-details-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl animate-rise-in border border-border-line">
            <div className="flex items-center justify-between pb-3 border-b border-border-line">
              <h3 id="profile-details-title" className="text-lg font-bold text-ink">
                Profile Details
              </h3>
              <button
                type="button"
                onClick={() => setProfileDetailsOpen(false)}
                className="h-8 w-8 rounded-full bg-surface-muted flex items-center justify-center text-subtle hover:text-ink transition-colors"
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 text-sm">
              <div className="flex justify-between py-1 border-b border-border-line/40">
                <span className="text-subtle">Full Name</span>
                <span className="font-semibold text-ink">{persona.profile.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-line/40">
                <span className="text-subtle">Employee ID</span>
                <span className="font-semibold text-ink">{persona.profile.employeeId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-line/40">
                <span className="text-subtle">Corporate</span>
                <span className="font-semibold text-ink">{persona.profile.corporate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-line/40">
                <span className="text-subtle">Work Email</span>
                <span className="font-semibold text-ink">{persona.profile.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-line/40">
                <span className="text-subtle">Mobile</span>
                <span className="font-semibold text-ink">{persona.profile.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-line/40">
                <span className="text-subtle">Account Type</span>
                <span className="font-semibold text-pine-dark">{persona.label}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-subtle">Status</span>
                <span className="inline-flex items-center gap-1 font-semibold text-success">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  Active
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setProfileDetailsOpen(false)}
              className="mt-5 w-full rounded-xl bg-pine py-2.5 font-bold text-white shadow-sm hover:bg-pine-dark active:scale-[0.99] transition-all"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}

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
  const stroke =
    id === "logout"
      ? colors.subtle
      : id === "collect"
        ? colors.warning
        : id === "autopay"
          ? colors.pinePrimary
          : colors.pinePrimary;

  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    "aria-hidden": true as const,
  };

  if (id === "profile") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3.5" stroke={stroke} strokeWidth="1.7" />
        <path
          d="M5 19.5c1.8-4 5-6 7-6s5.2 2 7 6"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (id === "autopay") {
    return (
      <svg {...common}>
        <path
          d="M12 3 4.5 6.5v5.2c0 5 3.2 8.4 7.5 9.8 4.3-1.4 7.5-4.8 7.5-9.8V6.5L12 3Z"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="m9 12 2.2 2.2L15.5 10"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (id === "collect") {
    return (
      <svg {...common}>
        <path
          d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M14 3v4h4" stroke={stroke} strokeWidth="1.7" />
        <path
          d="m9 14 2 2 4-4"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

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
