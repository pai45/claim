import type { ChatMessage } from "@/features/chat/types";
import type { AssistantTurn } from "./assistantApiTypes";

/** Turns kept for prompt context. Two exchanges is enough for "and last month?". */
export const MAX_HISTORY_TURNS = 4;
const MAX_TURN_CHARS = 600;

/** Message kinds that carry UI payloads rather than readable prose. */
const CARD_KINDS = new Set([
  "upload_options",
  "policy_options",
  "merchant_type_options",
  "merchant_search_options",
  "merchant_name_input",
  "merchant_results",
  "vehicle_number_input",
  "vehicle_details",
  "driver_name_input",
  "driver_dl_upload",
  "driver_dl_extract",
  "driver_salary_input",
  "driver_salary_review",
  "bill_extract",
]);

/**
 * Projects the visible transcript into prompt turns. Card messages are dropped
 * — their `content` is a placeholder label like "Upload options", which is
 * noise to the model.
 */
export function buildAssistantHistory(
  messages: ChatMessage[],
  limit = MAX_HISTORY_TURNS,
): AssistantTurn[] {
  const turns: AssistantTurn[] = [];

  for (const message of messages) {
    if (message.kind && CARD_KINDS.has(message.kind)) continue;
    const content = message.content.trim();
    if (!content) continue;
    turns.push({
      role: message.role,
      content:
        content.length > MAX_TURN_CHARS
          ? `${content.slice(0, MAX_TURN_CHARS)}…`
          : content,
    });
  }

  const recent = turns.slice(-limit);
  // A prompt that opens on an assistant turn confuses small instruct models.
  const firstUser = recent.findIndex((turn) => turn.role === "user");
  return firstUser <= 0 ? recent : recent.slice(firstUser);
}
