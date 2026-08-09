import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NativeMonthPicker } from "./NativeMonthPicker";

describe("NativeMonthPicker", () => {
  it("uses the platform month input and caps selection at August 2026", () => {
    const markup = renderToStaticMarkup(
      createElement(
        NativeMonthPicker,
        {
          value: "2026-07",
          onChange: () => {},
          label: "Choose month",
        },
        "Calendar",
      ),
    );

    expect(markup).toContain('type="month"');
    expect(markup).toContain('min="2026-04"');
    expect(markup).toContain('max="2026-08"');
    expect(markup).toContain('value="2026-07"');
  });
});
