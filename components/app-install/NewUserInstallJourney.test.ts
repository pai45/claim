import { createElement } from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { NewUserInstallJourney } from "./NewUserInstallJourney";

describe("NewUserInstallJourney", () => {
  it("opens on Pine Labs's tailored PlusPay message and download URLs", () => {
    const markup = renderToStaticMarkup(
      createElement(NewUserInstallJourney, { onComplete: vi.fn() }),
    );

    expect(markup).toContain("Welcome, Pine Labs Team!");
    expect(markup).toContain("corporate payments and claims just got easier");
    expect(markup).toContain("login via OTP received on your official mail");
    expect(markup).toContain("Key Features:");
    expect(markup).toContain("Dedicated Customer Manager");
    expect(markup).toContain("pinelabs@PlusPayapp.com");
    expect(markup).toContain("Team PlusPay");
    expect(markup).toContain(
      "https://play.google.com/store/apps/details?id=com.PlusPay.app",
    );
    expect(markup).toContain(
      "https://apps.apple.com/in/app/PlusPay-payments-disbursals/id1584941705",
    );
  });

  it("uses dedicated WhatsApp and Play Store visual systems", () => {
    const component = readFileSync(
      join(process.cwd(), "components/app-install/NewUserInstallJourney.tsx"),
      "utf8",
    );
    const styles = readFileSync(
      join(process.cwd(), "components/app-install/nativeInstallMocks.css"),
      "utf8",
    );

    expect(component).toContain("install-wa-screen");
    expect(component).toContain("install-play-screen");
    expect(component).toContain("Ratings and reviews");
    expect(component).toContain("Ananya Sharma");
    expect(component).toContain("Rahul Verma");
    expect(component).toContain("Was this review helpful?");
    expect(component).not.toContain("play-screenshots");
    expect(component).not.toContain("play-preview");
    expect(component).not.toContain("WELCOME TO");
    expect(styles).toContain("background: #008069");
    expect(styles).toContain("background: #efeae2");
    expect(styles).toContain("background: #01875f");
    expect(styles).toContain("color: #202124");
    expect(styles).toContain("filter: brightness(0) invert(1)");
  });
});
