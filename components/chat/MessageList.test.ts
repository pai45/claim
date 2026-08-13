import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ChatMessage } from "@/features/chat/types";
import { MessageList } from "./MessageList";

const messages: ChatMessage[] = [
  {
    id: "assistant-1",
    role: "assistant",
    kind: "text",
    content: "First reply",
    createdAt: 1,
  },
  {
    id: "user-1",
    role: "user",
    kind: "text",
    content: "Follow-up question",
    createdAt: 2,
  },
  {
    id: "assistant-2",
    role: "assistant",
    kind: "text",
    content: "Latest reply",
    createdAt: 3,
  },
];

function benefitsLogoCount(html: string) {
  return (html.match(/benefits-logo-v2\.gif/g) ?? []).length;
}

describe("MessageList assistant avatar", () => {
  it("mounts the animated Benefits logo only for the latest assistant reply", () => {
    const html = renderToStaticMarkup(createElement(MessageList, { messages }));

    expect(html).toContain("First reply");
    expect(html).toContain("Latest reply");
    expect(benefitsLogoCount(html)).toBe(1);
  });

  it("orders the logo before generated text and the latest option card", () => {
    const optionMessages: ChatMessage[] = [
      ...messages,
      {
        id: "user-2",
        role: "user",
        kind: "text",
        content: "Start a new claim",
        createdAt: 4,
      },
      {
        id: "assistant-intro",
        role: "assistant",
        kind: "text",
        content: "Sure. Upload a bill and I'll read it for you.",
        createdAt: 5,
      },
      {
        id: "assistant-options",
        role: "assistant",
        kind: "upload_options",
        content: "Choose how to upload your bill.",
        createdAt: 6,
      },
    ];

    const html = renderToStaticMarkup(
      createElement(MessageList, { messages: optionMessages }),
    );

    expect(html).toContain("Upload options");
    expect(benefitsLogoCount(html)).toBe(1);
    expect(html.indexOf("benefits-logo-v2.gif")).toBeLessThan(
      html.indexOf("Sure. Upload a bill"),
    );
    expect(html.indexOf("Sure. Upload a bill")).toBeLessThan(
      html.indexOf("Upload options"),
    );
  });

  it("moves the animated Benefits logo to the active typing status", () => {
    const html = renderToStaticMarkup(
      createElement(MessageList, { messages, isLoading: true }),
    );

    expect(html).toContain('aria-label="AI is thinking"');
    expect(benefitsLogoCount(html)).toBe(1);
  });
});
