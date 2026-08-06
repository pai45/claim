"use client";

import type { ReactNode } from "react";

type CardTemplateProps = {
  title: string;
  badgeText?: string;
  badgeVariant?: "success" | "warning" | "danger";
  children: ReactNode;
  footerAction?: {
    label: string;
    onClick: () => void;
  };
};

const badgeClasses = {
  success: "bg-success-soft text-success border-success-border",
  warning: "bg-warning-soft text-warning border-warning-border",
  danger: "bg-danger-soft text-danger border-border-soft",
} as const;

export function CardTemplate({
  title,
  badgeText,
  badgeVariant = "success",
  children,
  footerAction,
}: CardTemplateProps) {
  return (
    <div className="w-full rounded-card border border-border-line bg-white p-card shadow-card">
      <div className="flex items-center justify-between pb-3">
        <h3 className="type-section-title text-pine">{title}</h3>
        {badgeText ? (
          <span
            className={`rounded-pill border px-2.5 py-0.5 text-caption font-semibold ${badgeClasses[badgeVariant]}`}
          >
            {badgeText}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">{children}</div>

      {footerAction ? (
        <div className="mt-4 border-t border-border-soft pt-3">
          <button
            type="button"
            onClick={footerAction.onClick}
            className="flex min-h-11 w-full items-center justify-center rounded-control bg-surface-tint py-2.5 text-body-sm font-bold text-pine-primary transition-opacity hover:opacity-90 active:scale-[0.99]"
          >
            {footerAction.label}
          </button>
        </div>
      ) : null}
    </div>
  );
}
