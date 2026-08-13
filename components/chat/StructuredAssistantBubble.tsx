"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChatAvatar } from "@/components/chat/ChatAvatar";
import { useRevealText } from "@/components/chat/useRevealText";

export type StructuredReplyAction = {
  href: string;
  label: string;
};

type StructuredAssistantBubbleProps = {
  title: string;
  summary?: string;
  reveal?: boolean;
  showAvatar?: boolean;
  actions?: StructuredReplyAction[];
  children: ReactNode;
};

export function StructuredAssistantBubble({
  title,
  summary,
  reveal = false,
  showAvatar = true,
  actions = [],
  children,
}: StructuredAssistantBubbleProps) {
  const { visible } = useRevealText({ text: summary ?? "", enabled: reveal });

  return (
    <div className="flex w-full max-w-card flex-col items-start gap-2.5">
      {showAvatar ? <ChatAvatar className="ml-0.5" /> : null}
      <article className="w-full overflow-hidden rounded-bubble rounded-tl-control border border-border-line bg-white shadow-soft">
        <header className="border-b border-border-line bg-surface-tint px-card py-3">
          <h2 className="type-section-title text-pine">{title}</h2>
        </header>

        <div className="flex flex-col gap-4 p-card">
          {summary ? <p className="type-body-secondary text-ink">{visible}</p> : null}
          {children}
        </div>

        {actions.length > 0 ? (
          <footer className="flex flex-col border-t border-border-line bg-surface px-card py-1">
            {actions.map((action, index) => (
              <Link
                key={`${action.href}-${action.label}`}
                href={action.href}
                className={`flex min-h-11 w-full items-center justify-center px-4 py-2.5 text-center text-body-sm font-bold text-pine-primary outline-none transition-colors hover:bg-surface-tint focus-visible:outline-2 focus-visible:outline-pine-primary ${
                  index > 0 ? "border-t border-border-soft" : ""
                }`}
              >
                {action.label}
              </Link>
            ))}
          </footer>
        ) : null}
      </article>
    </div>
  );
}
