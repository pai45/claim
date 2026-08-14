import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { TransactionListCard } from "@/components/transactions/TransactionListCard";

describe("TransactionListCard", () => {
  it("renders the shared transaction-history row treatment", () => {
    const markup = renderToStaticMarkup(
      createElement(TransactionListCard, {
        items: [
          {
            id: "EBBANK202603",
            title: "Anjali Kumar",
            subtitle: "Bank Transfer | Ref ID: EBBANK202603",
            amountLabel: "- ₹4,000",
            metaLabel: "3:00 pm",
            icon: createElement("span", null, "wallet"),
          },
        ],
        onSelect: vi.fn(),
      }),
    );

    expect(markup).toContain("rounded-card border border-border-line");
    expect(markup).toContain("bg-success-tint text-success");
    expect(markup).toContain("Anjali Kumar");
    expect(markup).toContain("Bank Transfer | Ref ID: EBBANK202603");
    expect(markup).toContain("- ₹4,000");
    expect(markup).toContain("3:00 pm");
    expect(markup).not.toContain("border-success-border");
  });
});
