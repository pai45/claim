"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { AppIcon } from "@/components/shared/AppIcon";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { ToggleSwitch } from "@/components/shared/ToggleSwitch";
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
import { UI_ICONS } from "@/lib/ui/assets";
import { staggerStyle } from "@/lib/ui/staggerStyle";

const LIMIT_CHANNEL_ICONS: Record<LimitChannelId, string> = {
  online: UI_ICONS.onlineTransactions,
  pos: UI_ICONS.pos,
  contactless: UI_ICONS.tapToPay,
};

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
          <AppIcon src={LIMIT_CHANNEL_ICONS[channel.icon]} alt="" size={20} />
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

