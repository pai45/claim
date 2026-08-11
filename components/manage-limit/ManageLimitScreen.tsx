"use client";

import { useEffect, useState, useRef, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { useModalFocus } from "@/lib/ui/useModalFocus";
import {
  LIMIT_CHANNELS,
  createDefaultLimitState,
  formatLimitINR,
  loadLimitState,
  saveLimitState,
  type LimitChannelConfig,
  type LimitChannelId,
  type LimitChannelState,
  type ManageLimitState,
} from "@/features/manage-limit/constants";
import { colors } from "@/lib/ui/colors";
import { staggerStyle } from "@/lib/ui/staggerStyle";

export function ManageLimitScreen() {
  const router = useRouter();
  const [channels, setChannels] = useState<ManageLimitState>(
    createDefaultLimitState,
  );
  const [initialChannels, setInitialChannels] = useState<ManageLimitState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const state = loadLimitState();
      setInitialChannels(state);
      setChannels(state);
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function updateChannel(
    id: LimitChannelId,
    patch: Partial<LimitChannelState>,
  ) {
    setChannels((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  }

  function handleSave() {
    saveLimitState(channels);
    setInitialChannels(channels);
    setShowSuccessModal(true);
  }

  const hasChanges =
    hydrated &&
    initialChannels !== null &&
    LIMIT_CHANNELS.some(({ id }) => {
      const current = channels[id];
      const initial = initialChannels[id];
      return (
        current.enabled !== initial.enabled ||
        current.dailyLimit !== initial.dailyLimit ||
        current.perTxnLimit !== initial.perTxnLimit
      );
    });

  return (
    <AppShell className="overflow-hidden">
      <ScreenHeader
        title="Manage Limit"
        onBack={() => router.push("/?returnTo=manage-cards")}
      />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-4 pt-4">
        <h2 className="type-section-title mb-3 text-pine-primary">
          Domestic Usage
        </h2>

        <div className="flex flex-col gap-3">
          {LIMIT_CHANNELS.map((channel, index) => (
            <LimitChannelCard
              key={channel.id}
              channel={channel}
              state={channels[channel.id]}
              ready={hydrated}
              style={staggerStyle(index)}
              onToggle={(enabled) => updateChannel(channel.id, { enabled })}
              onDailyChange={(dailyLimit) =>
                updateChannel(channel.id, { dailyLimit })
              }
              onPerTxnChange={(perTxnLimit) =>
                updateChannel(channel.id, { perTxnLimit })
              }
            />
          ))}
        </div>
      </main>

      {hasChanges ? (
        <div className="animate-rise-in shrink-0 border-t border-border-soft bg-white px-page pb-6 pt-3">
          <button type="button" className="btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      ) : null}

      <SuccessModal
        open={showSuccessModal}
        title="Limits Updated Successfully"
        onClose={() => setShowSuccessModal(false)}
      />
    </AppShell>
  );
}

function SuccessModal({
  open,
  title,
  onClose,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  useModalFocus(containerRef, open, onClose);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[70] mx-auto max-w-phone ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Cancel"
        onClick={onClose}
        className={`absolute inset-0 bg-pine/40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="manage-limit-success-title"
        className={`absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-card bg-white p-6 pt-10 text-center shadow-menu transition-all duration-200 ${open ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex min-h-11 min-w-11 items-center justify-center rounded-control text-ink-secondary hover:text-ink"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="absolute -top-[53px] left-1/2 -translate-x-1/2">
          <svg viewBox="0 0 106 106" width="106" height="106" aria-hidden="true">
            <circle cx="53" cy="53" r="53" fill={colors.white} />
            <g transform="translate(18 18)">
              <path
                d="M64.4008 28.5367L62.0164 25.6492C61.2836 24.7523 60.8352 23.6695 60.7258 22.5211L60.3648 18.7914C59.9055 13.957 56.0555 10.107 51.2211 9.64766L47.4914 9.28672C46.343 9.17734 45.2602 8.72891 44.3633 7.98516L41.4758 5.60078C37.7242 2.50547 32.2883 2.50547 28.5367 5.60078L25.6492 7.98516C24.7523 8.71797 23.6695 9.17734 22.5211 9.28672L18.7914 9.64766C13.957 10.107 10.107 13.957 9.64766 18.7914L9.28672 22.5211C9.17734 23.6805 8.72891 24.7633 7.98516 25.6492L5.60078 28.5367C2.50547 32.2883 2.50547 37.7242 5.60078 41.4758L7.98516 44.3633C8.71797 45.2602 9.16641 46.343 9.27578 47.4914L9.63672 51.2211C10.0961 56.0555 13.9461 59.9055 18.7805 60.3648L22.5102 60.7258C23.6586 60.8352 24.7414 61.2836 25.6383 62.0273L28.5258 64.4117C30.3961 65.9539 32.693 66.7305 34.9898 66.7305C37.2867 66.7305 39.5836 65.9539 41.4539 64.4117L44.3414 62.0273C45.2383 61.2945 46.3211 60.8352 47.4695 60.7258L51.1992 60.3648C56.0336 59.9055 59.8836 56.0555 60.343 51.2211L60.7039 47.4914C60.8133 46.332 61.2617 45.2492 62.0055 44.3633L64.3898 41.4758C67.4852 37.7242 67.4852 32.2883 64.3898 28.5367H64.4008Z"
                fill={colors.success}
              />
              <path
                d="M30.9162 44.4236L22.0254 35.5327L23.8071 33.7507L30.9162 40.8598L46.1921 25.584L47.9737 27.3661L30.9162 44.4236Z"
                fill={colors.white}
              />
            </g>
          </svg>
        </div>

        <h2
          id="manage-limit-success-title"
          className="type-section-title px-4 pb-2"
        >
          {title}
        </h2>
        <div className="mt-5">
          <button type="button" onClick={onClose} className="btn-primary min-h-11 h-auto py-3 w-full">OK</button>
        </div>
      </section>
    </div>
  );
}

function LimitChannelCard({
  channel,
  state,
  ready,
  style,
  onToggle,
  onDailyChange,
  onPerTxnChange,
}: {
  channel: LimitChannelConfig;
  state: LimitChannelState;
  ready: boolean;
  style?: CSSProperties;
  onToggle: (enabled: boolean) => void;
  onDailyChange: (value: number) => void;
  onPerTxnChange: (value: number) => void;
}) {
  const expanded = ready && state.enabled;

  return (
    <section
      style={style}
      className="animate-rise-in overflow-hidden rounded-card border border-border-line bg-white shadow-card"
    >
      <div className="flex min-h-14 items-center gap-3 p-card">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-success-tint">
          <ChannelIcon id={channel.icon} />
        </span>
        <p className="type-body min-w-0 flex-1 font-bold text-ink">
          {channel.label}
        </p>
        <ToggleSwitch
          checked={state.enabled}
          label={channel.label}
          onChange={onToggle}
        />
      </div>

      {expanded ? (
        <div className="border-t border-border-line px-4 pb-4 pt-3">
          <LimitSlider
            label="Daily Spending Limit"
            value={state.dailyLimit}
            min={channel.daily.min}
            max={channel.daily.max}
            step={channel.daily.step}
            onChange={onDailyChange}
          />
          <div className="mt-4">
            <LimitSlider
              label="Per Transaction Limit"
              value={state.perTxnLimit}
              min={channel.perTxn.min}
              max={channel.perTxn.max}
              step={channel.perTxn.step}
              onChange={onPerTxnChange}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function LimitSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="type-body-secondary">{label}</p>
        <span className="rounded-pill bg-success-tint px-2.5 py-1 text-caption font-bold text-pine-primary">
          {formatLimitINR(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value))}
        className="limit-slider h-2 w-full cursor-pointer appearance-none rounded-pill bg-surface-muted"
        style={{
          background: `linear-gradient(90deg, ${colors.success} 0%, ${colors.success} ${percent}%, ${colors.surfaceMuted} ${percent}%, ${colors.surfaceMuted} 100%)`,
        }}
      />
      <div className="flex items-center justify-between text-caption text-ink-secondary">
        <span>{formatLimitINR(min)}</span>
        <span>{formatLimitINR(max)}</span>
      </div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-pill transition-colors ${
        checked ? "bg-success" : "bg-border-muted"
      }`}
    >
      <span
        className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-soft transition-transform ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ChannelIcon({ id }: { id: LimitChannelId }) {
  const stroke = colors.pinePrimary;
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    "aria-hidden": true as const,
  };

  if (id === "online") {
    return (
      <svg {...common}>
        <path
          d="M4 8h16l-1.5 11.2a1.5 1.5 0 0 1-1.5 1.3H7a1.5 1.5 0 0 1-1.5-1.3L4 8Z"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M8 8V7a4 4 0 0 1 8 0v1M9 12h.01M12 12h.01M15 12h.01"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (id === "pos") {
    return (
      <svg {...common}>
        <rect
          x="4"
          y="3"
          width="12"
          height="18"
          rx="2"
          stroke={stroke}
          strokeWidth="1.7"
        />
        <path
          d="M7 7h6M7 10h6M7 13h4M16 10h3.5A1.5 1.5 0 0 1 21 11.5V16a2 2 0 0 1-2 2h-3"
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path
        d="M7 12a5 5 0 0 1 5-5M5 12a7 7 0 0 1 7-7M9 12a3 3 0 0 1 3-3"
        stroke={stroke}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.5" r="1.5" fill={stroke} />
      <rect
        x="8"
        y="18"
        width="8"
        height="2.5"
        rx="1"
        stroke={stroke}
        strokeWidth="1.4"
      />
    </svg>
  );
}
