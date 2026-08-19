"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppIcon } from "@/components/shared/AppIcon";
import { BackNavigationButton } from "@/components/shared/BackNavigationButton";
import { useNotifications } from "@/features/notifications/useNotifications";
import { UI_ICONS } from "@/lib/ui/assets";
import { HeaderMenu } from "./HeaderMenu";

type ChatHeaderProps = {
  onNewChat: () => void;
  /** Used when the assistant is presented inside another app's modal. */
  onBack?: () => void;
};

export function ChatHeader({ onNewChat, onBack }: ChatHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { count: notificationCount } = useNotifications();

  return (
    <>
      <header
        className="animate-rise-in flex items-center gap-3 border-b border-white/40 bg-white/70 px-page pb-3 pt-4 backdrop-blur-xl"
        style={{ animationDelay: "0ms" }}
      >
        <BackNavigationButton
          ariaLabel={onBack ? "Close Benefits Assistant" : "Go back"}
          onClick={() => {
            if (onBack) onBack();
            else router.back();
          }}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="type-screen-title truncate">Benefits assistant</h1>
        </div>

        <button
          type="button"
          id="chat-header-menu-trigger"
          aria-label={
            notificationCount > 0
              ? `Open menu, ${notificationCount} unread ${notificationCount === 1 ? "notification" : "notifications"}`
              : "Open menu"
          }
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-pine"
        >
          <AppIcon src={UI_ICONS.menu} size={24} alt="" />
          {/* Notifications live inside the menu, so the unread state has to
              surface on the trigger or it stays invisible. Same dot as the
              home screen's alerts card. The count itself is spelled out in
              `aria-label` above, since the dot is decorative. */}
          {notificationCount > 0 ? (
            <span
              aria-hidden
              className="absolute right-2 top-2 h-2.5 w-2.5 rounded-pill border-2 border-white bg-notify"
            />
          ) : null}
        </button>
      </header>

      <HeaderMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNewChat={onNewChat}
      />
    </>
  );
}
