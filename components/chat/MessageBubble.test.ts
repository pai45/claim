import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ChatMessage } from "@/features/chat/types";
import { MessageBubble } from "./MessageBubble";

describe("MessageBubble", () => {
  it("offers driver details and a new claim after driver registration", () => {
    const message: ChatMessage = {
      id: "driver-claim",
      role: "assistant",
      content: "Driver registration CLM-87549 submitted to Admin.",
      createdAt: 0,
      kind: "claim_cta",
      claimId: "CLM-87549",
      driverSalary: {
        driverName: "Kai",
        salary: "15000",
        submitted: true,
      },
    };

    const html = renderToStaticMarkup(
      createElement(MessageBubble, {
        message,
        onNewClaim: () => undefined,
      }),
    );

    expect(html).toContain('href="/driver"');
    expect(html).toContain("View driver details");
    expect(html).toContain("New claim");
  });
});
