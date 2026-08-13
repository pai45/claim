import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const component = readFileSync(
  join(process.cwd(), "components/walkthrough/WalkthroughOverlay.tsx"),
  "utf8",
);
const styles = readFileSync(
  join(process.cwd(), "components/walkthrough/walkthrough.css"),
  "utf8",
);

describe("WalkthroughOverlay tooltip", () => {
  it("waits for measured geometry before rendering a coachmark", () => {
    expect(component.match(/rect && geometry \?/g)).toHaveLength(2);
  });

  it("positions a branded caret on the target-facing edge", () => {
    expect(component).toContain('"--walkthrough-pointer-left"');
    expect(component).toContain("walkthrough-card--${geometry.placement.edge}");
    expect(styles).toContain(".walkthrough-card--below .walkthrough-tooltip::before");
    expect(styles).toContain(".walkthrough-card--above .walkthrough-tooltip::before");
    expect(styles).toContain("var(--color-pine-primary)");
    expect(styles).toContain("rgba(54, 204, 139");
  });
});
