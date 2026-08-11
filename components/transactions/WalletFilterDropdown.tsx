"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { BenefitWalletIcon } from "@/components/shared/BenefitWalletIcon";
import {
  WALLET_FILTER_OPTIONS,
  type TransactionWalletFilterId,
} from "@/features/transactions/constants";

type WalletFilterDropdownProps = {
  selectedWallet: TransactionWalletFilterId;
  onSelectWallet: (walletId: TransactionWalletFilterId) => void;
  className?: string;
};

export function WalletFilterDropdown({
  selectedWallet,
  onSelectWallet,
  className = "",
}: WalletFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedOption =
    WALLET_FILTER_OPTIONS.find((option) => option.id === selectedWallet) ??
    WALLET_FILTER_OPTIONS[0];

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Handle global Escape key to close dropdown and restore trigger focus
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen(true);
      // Focus first option or selected option on open
      setTimeout(() => {
        const selectedIndex = WALTON_INDEX(selectedWallet);
        optionRefs.current[selectedIndex]?.focus();
      }, 0);
    }
  };

  const WALTON_INDEX = (walletId: TransactionWalletFilterId) => {
    const idx = WALLET_FILTER_OPTIONS.findIndex((o) => o.id === walletId);
    return idx >= 0 ? idx : 0;
  };

  const handleOptionKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (index + 1) % WALLET_FILTER_OPTIONS.length;
      optionRefs.current[nextIndex]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const prevIndex =
        (index - 1 + WALLET_FILTER_OPTIONS.length) %
        WALLET_FILTER_OPTIONS.length;
      optionRefs.current[prevIndex]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      optionRefs.current[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      optionRefs.current[WALLET_FILTER_OPTIONS.length - 1]?.focus();
    } else if (event.key === "Tab") {
      setIsOpen(false);
    }
  };

  const handleSelect = (walletId: TransactionWalletFilterId) => {
    onSelectWallet(walletId);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id="wallet-filter-button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="wallet-filter-menu"
        aria-label={`Filter by wallet, currently ${selectedOption.label}`}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-pill bg-pine-primary px-4 py-1 text-body-sm font-bold text-white transition-colors hover:bg-pine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-primary"
      >
        <span>{selectedOption.label}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div
          id="wallet-filter-menu"
          role="listbox"
          aria-labelledby="wallet-filter-button"
          tabIndex={-1}
          className="animate-rise-in absolute left-0 top-full z-30 mt-2 min-w-[220px] max-w-[280px] overflow-hidden rounded-card border border-border-line bg-white p-2 shadow-card"
        >
          <div className="flex flex-col gap-1">
            {WALLET_FILTER_OPTIONS.map((option, index) => {
              const isSelected = option.id === selectedWallet;
              return (
                <button
                  key={option.id}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.id)}
                  onKeyDown={(e) => handleOptionKeyDown(e, index)}
                  className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-control px-3.5 py-2.5 text-left text-body-sm transition-colors ${
                    isSelected
                      ? "bg-surface-tint font-bold text-ink"
                      : "font-normal text-ink-secondary hover:bg-surface-tint hover:text-ink"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-control ${option.toneClass} ${option.iconClass}`}
                    >
                      <BenefitWalletIcon wallet={option.id} size={18} />
                    </span>
                    <span className="truncate">{option.label}</span>
                  </span>
                  {isSelected && (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 text-pine-primary"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
