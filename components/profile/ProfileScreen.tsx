"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ChevronRightIcon } from "@/components/shared/ChevronRightIcon";
import { clearAuthSession } from "@/features/auth/session";
import { clearChatSession } from "@/features/chat/persistence";
import { clearOnboarding } from "@/features/onboarding/storage";
import {
  PROFILE_MENU_ITEMS,
  PROFILE_USER,
  type ProfileMenuId,
} from "@/features/profile/constants";
import { clearRegisteredVehicle } from "@/features/vehicle/registration";
import { colors } from "@/lib/ui/colors";
import { staggerStyle } from "@/lib/ui/staggerStyle";

export function ProfileScreen() {
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function handleMenu(id: ProfileMenuId) {
    if (id === "logout") {
      setLogoutOpen(true);
      return;
    }
    const labels: Record<Exclude<ProfileMenuId, "logout">, string> = {
      profile: "Profile details coming soon",
      autopay: "AutoPay settings coming soon",
      collect: "Collect requests coming soon",
    };
    setNotice(labels[id]);
  }

  function confirmLogout() {
    setLogoutOpen(false);
    // The transcript and registered vehicle are keyed to a person, so leaving
    // them would carry one login's data into the next.
    clearChatSession();
    clearRegisteredVehicle();
    clearOnboarding();
    clearAuthSession();
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
            className="flex h-24 w-24 items-center justify-center rounded-full shadow-soft"
            style={{
              background: `linear-gradient(180deg, ${colors.pinePrimary} 0%, ${colors.pine} 55%, ${colors.mint} 160%)`,
            }}
            aria-hidden="true"
          >
            <PersonSilhouette />
          </div>
          <h2 className="type-section-title mt-2 text-center text-ink">
            {PROFILE_USER.name}
          </h2>
          <p className="type-body-secondary text-center">
            {PROFILE_USER.memberSince}
          </p>
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
        description="You will return to the home screen. You can sign back in anytime."
        confirmLabel="Logout"
        cancelLabel="Stay signed in"
        onConfirm={confirmLogout}
        onClose={() => setLogoutOpen(false)}
      />
    </AppShell>
  );
}

function PersonSilhouette() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="18" r="9" fill="white" />
      <path
        d="M8 42c2.5-10 10-14 16-14s13.5 4 16 14"
        fill="white"
      />
    </svg>
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
