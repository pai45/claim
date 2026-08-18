import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const component = readFileSync(
  join(process.cwd(), "components/benefits-nudge/BenefitsCtaNudge.tsx"),
  "utf8",
);
const styles = readFileSync(
  join(process.cwd(), "components/benefits-nudge/benefitsCtaNudge.css"),
  "utf8",
);

describe("BenefitsCtaNudge", () => {
  it("waits for measured geometry before pointing at anything", () => {
    expect(component).toContain("{showing && geometry ? (");
  });

  it("keeps the live region mounted so the card is announced when it lands", () => {
    // The root renders unconditionally and only its contents are gated, so the
    // region already exists when the card is put into it.
    const body = component.slice(component.indexOf("return ("));

    expect(body).toContain("ref={rootRef}");
    expect(body.indexOf("ref={rootRef}")).toBeLessThan(
      body.indexOf("{showing && geometry ? ("),
    );
  });

  it("positions a caret over the button with a custom property", () => {
    expect(component).toContain('"--benefits-nudge-pointer-left"');
    expect(styles).toContain("left: var(--benefits-nudge-pointer-left)");
    // Points down at the nav, which is always the bottom of the screen.
    expect(styles).toContain("border-top: 10px solid var(--color-pine-dark)");
  });

  it("leaves the app usable underneath", () => {
    // No scrim, no cutout, and a root that cannot intercept a tap. The
    // walkthrough dims by spreading a shadow to 9999px; nothing here may.
    expect(styles).toContain("pointer-events: none");
    expect(styles).not.toMatch(/box-shadow:[^;]*9999px/);
    // The root is inert and the card is the only thing that opts back in, so
    // the Benefits link underneath stays tappable throughout.
    expect(styles).toMatch(
      /\.benefits-nudge-root \{[^}]*pointer-events: none/,
    );
    expect(styles.match(/pointer-events: auto/g)).toHaveLength(1);
    expect(styles).toMatch(/\.benefits-nudge-card \{[^}]*pointer-events: auto/);
    expect(component).toContain('role="status"');
    expect(component).not.toContain('role="dialog"');
  });

  it("offers a dismissal at full touch-target size", () => {
    expect(component).toMatch(/aria-label="Dismiss"/);
    expect(component).toMatch(/onClick={retire}[\s\S]*?aria-label="Dismiss"/);
    expect(component).toContain("size-11");
  });

  it("retires itself for the session once the assistant is opened", () => {
    expect(component).toContain("markNudgeShown(window.sessionStorage)");
    expect(component).toContain("target.closest(BENEFITS_NAV_SELECTOR)");
  });

  it("guards every animation behind reduced motion", () => {
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");

    const guarded = styles.slice(
      styles.indexOf("@media (prefers-reduced-motion: reduce)"),
    );
    [
      ".benefits-nudge-card",
      ".benefits-nudge-surface::after",
      ".benefits-nudge-caret",
      ".benefits-nudge-halo",
    ].forEach((selector) => expect(guarded).toContain(selector));
    // The button still has to be marked out without motion.
    expect(guarded).toContain("rgba(54, 204, 139, 0.32)");
  });
});
