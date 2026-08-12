"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { CenterModal } from "@/components/onboarding/OnboardingModals";
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

      <CenterModal
        open={showSuccessModal}
        title="Limits Updated Successfully"
        description=""
        onConfirm={() => setShowSuccessModal(false)}
        onClose={() => setShowSuccessModal(false)}
      />
    </AppShell>
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
