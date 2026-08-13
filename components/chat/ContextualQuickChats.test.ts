import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  appDataPayloadForResolution,
  buildGroundedAppData,
} from "@/lib/assistant/appData";
import type { ChatMessage } from "@/features/chat/types";
import { getContextualQuickChats } from "@/features/chat/contextualQuickChats";
import { ContextualQuickChats } from "./ContextualQuickChats";
import { MessageList } from "./MessageList";

function dashboardMessage(): ChatMessage {
  const resolution = { kind: "dashboard" as const };
  const structured = buildGroundedAppData(resolution);
  return {
    id: "dashboard-answer",
    role: "assistant",
    content: "Here is your current claims balance.",
    createdAt: 1,
    kind: "app_data_answer",
    appDataAnswer: appDataPayloadForResolution(resolution, structured),
  };
}

describe("ContextualQuickChats", () => {
  it("renders three accessible, wrapping touch targets", () => {
    const actions = getContextualQuickChats(dashboardMessage());
    const html = renderToStaticMarkup(
      createElement(ContextualQuickChats, {
        actions,
        onSelect: vi.fn(),
      }),
    );

    expect(html).toContain('aria-label="Suggested replies"');
    expect(html).toContain("max-w-card flex-wrap");
    expect((html.match(/<button/g) ?? []).length).toBe(3);
    expect((html.match(/min-h-11/g) ?? []).length).toBe(3);
    expect(html).toContain("Show pending claims");
    expect(html).toContain("View claim history");
    expect(html).toContain("Check a policy");
  });

  it("renders suggestions only while the eligible answer is trailing", () => {
    const eligible = dashboardMessage();
    const userReply: ChatMessage = {
      id: "user-reply",
      role: "user",
      content: "Thanks",
      createdAt: 2,
      kind: "text",
    };

    const withTrailingAnswer = renderToStaticMarkup(
      createElement(MessageList, { messages: [eligible] }),
    );
    const withTrailingUser = renderToStaticMarkup(
      createElement(MessageList, { messages: [eligible, userReply] }),
    );

    expect(withTrailingAnswer).toContain('aria-label="Suggested replies"');
    expect(withTrailingUser).not.toContain('aria-label="Suggested replies"');
  });
});
