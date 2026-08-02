import { EMPLOYER_BENEFITS_CATALOG, type PolicyTabId } from "@/features/policy/constants";
import type { BenefitType } from "@/lib/merchants/types";
import type { AppDataContext } from "@/lib/assistant/appData";
import type { ChatMessage, DriverSalaryPayload } from "./types";

export const CHAT_STORAGE_KEY = "eb-claims:chat-session";
export const CHAT_STORAGE_VERSION = 1;

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type PersistedChatSession = {
  version: typeof CHAT_STORAGE_VERSION;
  savedAt: number;
  expiresAt: number;
  messages: ChatMessage[];
  driverSalaryDraft: DriverSalaryPayload;
  activeBenefitType: BenefitType | null;
  activePolicyCategory: PolicyTabId | null;
  activeAppDataContext: AppDataContext | null;
};

function sanitizeDriverSalary(
  payload?: DriverSalaryPayload,
): DriverSalaryPayload | undefined {
  if (!payload) return undefined;
  const safe = { ...payload };
  delete safe.dlRawText;
  return safe;
}

export function sanitizeChatMessage(message: ChatMessage): ChatMessage {
  return {
    ...message,
    billExtract: message.billExtract
      ? {
          ...message.billExtract,
          rawText: "",
          previewUrl: undefined,
          previewType: undefined,
        }
      : undefined,
    driverSalary: sanitizeDriverSalary(message.driverSalary),
  };
}

export function createPersistedChatSession(
  state: Omit<PersistedChatSession, "version" | "savedAt" | "expiresAt">,
  now = Date.now(),
): PersistedChatSession {
  const retentionMs =
    EMPLOYER_BENEFITS_CATALOG.privacy.retentionDays * 24 * 60 * 60 * 1000;
  return {
    ...state,
    version: CHAT_STORAGE_VERSION,
    savedAt: now,
    expiresAt: now + retentionMs,
    messages: state.messages.map(sanitizeChatMessage),
    driverSalaryDraft: sanitizeDriverSalary(state.driverSalaryDraft) ?? {},
  };
}

export function saveChatSession(
  session: PersistedChatSession,
  storage: StorageLike = window.localStorage,
): void {
  try {
    storage.setItem(CHAT_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage may be unavailable in private browsing or managed environments.
  }
}

export function loadChatSession(
  storage: StorageLike = window.localStorage,
  now = Date.now(),
): PersistedChatSession | null {
  try {
    const raw = storage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedChatSession>;
    if (
      parsed.version !== CHAT_STORAGE_VERSION ||
      !Array.isArray(parsed.messages) ||
      typeof parsed.expiresAt !== "number" ||
      parsed.expiresAt <= now
    ) {
      storage.removeItem(CHAT_STORAGE_KEY);
      return null;
    }
    return parsed as PersistedChatSession;
  } catch {
    storage.removeItem(CHAT_STORAGE_KEY);
    return null;
  }
}

export function clearChatSession(
  storage: StorageLike = window.localStorage,
): void {
  try {
    storage.removeItem(CHAT_STORAGE_KEY);
  } catch {
    // Clearing should remain safe when storage is blocked.
  }
}
