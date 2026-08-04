import { describe, expect, it } from "vitest";
import type { ChatMessage } from "@/features/chat/types";
import { buildAssistantHistory } from "./history";

function message(
  role: ChatMessage["role"],
  content: string,
  kind: ChatMessage["kind"] = "text",
): ChatMessage {
  return { id: content, role, content, createdAt: 0, kind };
}

describe("assistant prompt history", () => {
  it("keeps the most recent turns and starts on a user turn", () => {
    const history = buildAssistantHistory(
      [
        message("user", "one"),
        message("assistant", "two"),
        message("user", "three"),
        message("assistant", "four"),
        message("user", "five"),
        message("assistant", "six"),
      ],
      4,
    );

    expect(history).toEqual([
      { role: "user", content: "three" },
      { role: "assistant", content: "four" },
      { role: "user", content: "five" },
      { role: "assistant", content: "six" },
    ]);
  });

  it("drops the leading assistant turn when the window opens on one", () => {
    const history = buildAssistantHistory(
      [
        message("user", "one"),
        message("assistant", "two"),
        message("user", "three"),
      ],
      2,
    );

    expect(history).toEqual([{ role: "user", content: "three" }]);
  });

  it("skips card messages whose content is a placeholder label", () => {
    const history = buildAssistantHistory([
      message("user", "Upload a bill"),
      message("assistant", "Upload options", "upload_options"),
      message("assistant", "Bill scanned", "document_scan"),
      message("assistant", "Choose a benefit policy", "policy_options"),
    ]);

    expect(history).toEqual([{ role: "user", content: "Upload a bill" }]);
  });

  it("truncates a long turn rather than dropping it", () => {
    const history = buildAssistantHistory([
      message("user", "x".repeat(900)),
    ]);

    expect(history[0].content.length).toBeLessThanOrEqual(601);
    expect(history[0].content.endsWith("…")).toBe(true);
  });
});
