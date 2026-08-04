import { formatINR } from "@/features/claims-history/constants";

export type LimitChannelId = "online" | "pos" | "contactless";

export type LimitChannelConfig = {
  id: LimitChannelId;
  label: string;
  icon: LimitChannelId;
  daily: { min: number; max: number; step: number; defaultValue: number };
  perTxn: { min: number; max: number; step: number; defaultValue: number };
};

export type LimitChannelState = {
  enabled: boolean;
  dailyLimit: number;
  perTxnLimit: number;
};

export type ManageLimitState = Record<LimitChannelId, LimitChannelState>;

export const LIMIT_CHANNELS: LimitChannelConfig[] = [
  {
    id: "online",
    label: "Online (E-commerce)",
    icon: "online",
    daily: { min: 1250, max: 10000, step: 50, defaultValue: 2000 },
    perTxn: { min: 100, max: 2000, step: 50, defaultValue: 1000 },
  },
  {
    id: "pos",
    label: "POS (Merchant Swipe)",
    icon: "pos",
    daily: { min: 1250, max: 10000, step: 50, defaultValue: 3000 },
    perTxn: { min: 100, max: 5000, step: 50, defaultValue: 1500 },
  },
  {
    id: "contactless",
    label: "Contactless (Tap & Pay)",
    icon: "contactless",
    daily: { min: 500, max: 5000, step: 50, defaultValue: 2000 },
    perTxn: { min: 100, max: 2000, step: 50, defaultValue: 500 },
  },
];

export const MANAGE_LIMIT_STORAGE_KEY = "eb-claims:manage-limit";

export function createDefaultLimitState(): ManageLimitState {
  return LIMIT_CHANNELS.reduce((acc, channel) => {
    acc[channel.id] = {
      enabled: false,
      dailyLimit: channel.daily.defaultValue,
      perTxnLimit: channel.perTxn.defaultValue,
    };
    return acc;
  }, {} as ManageLimitState);
}

export function loadLimitState(): ManageLimitState {
  const defaults = createDefaultLimitState();
  if (typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(MANAGE_LIMIT_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<ManageLimitState>;
    return LIMIT_CHANNELS.reduce((acc, channel) => {
      const saved = parsed[channel.id];
      acc[channel.id] = {
        enabled: Boolean(saved?.enabled),
        dailyLimit: clamp(
          Number(saved?.dailyLimit ?? channel.daily.defaultValue),
          channel.daily.min,
          channel.daily.max,
        ),
        perTxnLimit: clamp(
          Number(saved?.perTxnLimit ?? channel.perTxn.defaultValue),
          channel.perTxn.min,
          channel.perTxn.max,
        ),
      };
      return acc;
    }, {} as ManageLimitState);
  } catch {
    return defaults;
  }
}

export function saveLimitState(state: ManageLimitState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MANAGE_LIMIT_STORAGE_KEY, JSON.stringify(state));
}

export function formatLimitINR(amount: number): string {
  return formatINR(amount);
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}
