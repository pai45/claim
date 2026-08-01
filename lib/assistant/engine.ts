import {
  ASSISTANT_INTENTS,
  FALLBACK_REPLY,
  type AssistantIntent,
} from "./replies";

const INTENT_PREFIX = "intent:";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreIntent(normalizedMessage: string, intent: AssistantIntent): number {
  let score = 0;

  for (const keyword of intent.keywords) {
    const normalizedKeyword = normalize(keyword);
    if (!normalizedKeyword) continue;

    if (normalizedMessage === normalizedKeyword) {
      score += 10;
      continue;
    }

    if (normalizedMessage.includes(normalizedKeyword)) {
      score += normalizedKeyword.split(" ").length >= 2 ? 6 : 3;
    }
  }

  return score;
}

export function resolveAssistantReply(
  message: string,
  intentId?: string,
): { reply: string; intentId: string } {
  if (intentId) {
    const byId =
      ASSISTANT_INTENTS.find((intent) => intent.id === intentId) ??
      (intentId === FALLBACK_REPLY.id ? FALLBACK_REPLY : undefined);

    if (byId) {
      return { reply: byId.reply, intentId: byId.id };
    }
  }

  const trimmed = message.trim();
  const prefixedIntent = trimmed.startsWith(INTENT_PREFIX)
    ? trimmed.slice(INTENT_PREFIX.length)
    : undefined;

  if (prefixedIntent) {
    return resolveAssistantReply("", prefixedIntent);
  }

  const normalizedMessage = normalize(trimmed);
  if (!normalizedMessage) {
    return { reply: FALLBACK_REPLY.reply, intentId: FALLBACK_REPLY.id };
  }

  let best: AssistantIntent | null = null;
  let bestScore = 0;

  for (const intent of ASSISTANT_INTENTS) {
    const score = scoreIntent(normalizedMessage, intent);
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }

  if (!best || bestScore === 0) {
    return { reply: FALLBACK_REPLY.reply, intentId: FALLBACK_REPLY.id };
  }

  return { reply: best.reply, intentId: best.id };
}
