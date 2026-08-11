"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppIcon } from "@/components/shared/AppIcon";
import { AppShell } from "@/components/shared/AppShell";
import { ChevronRightIcon } from "@/components/shared/ChevronRightIcon";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { setPendingChatIntent } from "@/features/chat/pendingIntent";
import type { BenefitsNotification } from "@/features/notifications/constants";
import {
  hideAllNotifications,
  showAllNotifications,
} from "@/features/notifications/storage";
import { useNotifications } from "@/features/notifications/useNotifications";
import { useActivePersona } from "@/features/persona/useActivePersona";
import { UI_ICONS } from "@/lib/ui/assets";
import { staggerStyle } from "@/lib/ui/staggerStyle";

const TONE_CLASS: Record<BenefitsNotification["tone"], string> = {
  default: "bg-surface-tint text-pine-primary",
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-warning",
  danger: "bg-danger-soft text-danger",
};

const ROW_CLASS =
  "animate-rise-in flex min-h-11 w-full items-start gap-3 border-b border-border-line px-card py-4 text-left transition-colors last:border-b-0 hover:bg-surface focus-visible:outline-2 focus-visible:outline-pine-primary";

export function NotificationsScreen() {
  const router = useRouter();
  const { personaId } = useActivePersona();
  const { notifications, hidden, totalCount } = useNotifications();

  function openAssistantNotification(notification: BenefitsNotification) {
    if (notification.action.kind !== "assistant") return;
    setPendingChatIntent({
      kind: "assistant_intent",
      intentId: notification.action.intentId,
      label: notification.action.label,
    });
    router.push("/#claims");
  }

  return (
    <AppShell className="overflow-hidden">
      <ScreenHeader title="Notifications" onBack={() => router.back()}>
        {totalCount > 0 ? (
          <button
            type="button"
            onClick={() => {
              if (hidden) showAllNotifications();
              else hideAllNotifications();
            }}
            className="min-h-11 rounded-control px-3 text-body-sm font-bold text-pine-primary transition-colors hover:bg-surface-tint"
          >
            {hidden ? `Show all (${totalCount})` : "Hide all"}
          </button>
        ) : null}
      </ScreenHeader>

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-8 pt-4">
        {notifications.length > 0 ? (
          <section className="overflow-hidden rounded-card border border-border-line bg-white shadow-card">
            {notifications.map((notification, index) => {
              const content = (
                <>
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-control ${TONE_CLASS[notification.tone]}`}
                  >
                    <AppIcon src={UI_ICONS.notification} size={21} alt="" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="type-body font-bold text-ink">
                      {notification.title}
                    </span>
                    <span className="type-body-secondary text-subtle">
                      {notification.body}
                    </span>
                    <span className="text-caption text-ink-secondary">
                      {notification.dateLabel}
                    </span>
                  </span>
                  <span className="mt-2 shrink-0">
                    <ChevronRightIcon />
                  </span>
                </>
              );

              if (notification.action.kind === "claim") {
                return (
                  <Link
                    key={notification.id}
                    href={`/claim-details/?id=${encodeURIComponent(notification.action.claimId)}&from=notifications`}
                    className={ROW_CLASS}
                    style={staggerStyle(index)}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => openAssistantNotification(notification)}
                  className={ROW_CLASS}
                  style={staggerStyle(index)}
                >
                  {content}
                </button>
              );
            })}
          </section>
        ) : (
          <section className="flex flex-1 flex-col items-center justify-center px-card py-10 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-card bg-surface-tint">
              <AppIcon src={UI_ICONS.notification} size={30} alt="" />
            </span>
            <h2 className="mt-4 type-section-title text-pine">
              {hidden ? "Notifications hidden" : "No notifications"}
            </h2>
            <p className="mt-2 max-w-64 type-body-secondary">
              {hidden
                ? "Your notifications are hidden on this page and the Benefits Assistant home."
                : personaId === "new_user"
                  ? "Aarav doesn't have any notifications yet."
                  : "You're all caught up."}
            </p>
          </section>
        )}
      </main>

    </AppShell>
  );
}
