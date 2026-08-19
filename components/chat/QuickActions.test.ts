import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { QuickActions } from "./QuickActions";

describe("QuickActions", () => {
  it("renames the upload shortcut and only shows the draft shortcut when drafts exist", () => {
    const withoutDrafts = renderToStaticMarkup(
      createElement(QuickActions, {
        onSelect: () => undefined,
        onOpenDrafts: () => undefined,
      }),
    );
    const withDrafts = renderToStaticMarkup(
      createElement(QuickActions, {
        onSelect: () => undefined,
        onOpenDrafts: () => undefined,
        draftCount: 2,
      }),
    );

    expect(withoutDrafts).toContain("Upload claim");
    expect(withoutDrafts).not.toContain("claims in draft");
    expect(withDrafts).toContain("2 claims in draft");
    expect(withDrafts.indexOf("Upload claim")).toBeLessThan(
      withDrafts.indexOf("2 claims in draft"),
    );
  });
});
