"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { staggerStyle } from "@/lib/ui/staggerStyle";

export type TransactionListCardItem = {
  id: string;
  title: string;
  subtitle: string;
  amountLabel: string;
  metaLabel: string;
  icon: ReactNode;
  amountTone?: "default" | "success";
};

type TransactionListCardProps = {
  items: TransactionListCardItem[];
  getHref?: (item: TransactionListCardItem) => string;
  onSelect?: (item: TransactionListCardItem) => void;
};

export function TransactionListCard({
  items,
  getHref,
  onSelect,
}: TransactionListCardProps) {
  return (
    <div className="overflow-hidden rounded-card border border-border-line bg-white shadow-card">
      {items.map((item, index) => {
        const rowClassName = `animate-rise-in flex min-h-11 w-full items-center gap-3 px-page py-3.5 text-left transition-colors hover:bg-surface active:bg-surface ${
          index < items.length - 1 ? "border-b border-border-line" : ""
        }`;
        const content = <TransactionListRowContent item={item} />;
        const href = getHref?.(item);

        return href ? (
          <Link
            key={item.id}
            href={href}
            style={staggerStyle(index)}
            className={rowClassName}
          >
            {content}
          </Link>
        ) : (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item)}
            style={staggerStyle(index)}
            className={rowClassName}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}

function TransactionListRowContent({
  item,
}: {
  item: TransactionListCardItem;
}) {
  return (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-success-tint text-success">
        {item.icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="type-body truncate font-bold text-ink">
          {item.title}
        </span>
        <span className="truncate text-caption text-ink-secondary">
          {item.subtitle}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-0.5">
        <span
          className={`text-body-sm font-bold tabular-nums ${
            item.amountTone === "success" ? "text-success" : "text-ink"
          }`}
        >
          {item.amountLabel}
        </span>
        <span className="text-caption text-ink-secondary">
          {item.metaLabel}
        </span>
      </span>
    </>
  );
}
