import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const globalStyles = readFileSync(
  join(process.cwd(), "app/globals.css"),
  "utf8",
);
const drawer = readFileSync(
  join(process.cwd(), "components/chat/DocumentScenarioDrawer.tsx"),
  "utf8",
);
const claimExtract = readFileSync(
  join(process.cwd(), "components/chat/ClaimExtractCard.tsx"),
  "utf8",
);
const chatShell = readFileSync(
  join(process.cwd(), "components/chat/ChatShell.tsx"),
  "utf8",
);

describe("Benefits Assistant desktop responsiveness", () => {
  it("fits the phone canvas within the available desktop viewport", () => {
    expect(globalStyles).toMatch(
      /@media \(min-width: 541px\)[\s\S]*body \{[\s\S]*min-height: 100dvh/,
    );
    expect(globalStyles).toContain(
      "height: min(874px, calc(100dvh - 48px));",
    );
    expect(globalStyles).not.toContain("min-height: max(100dvh, 922px)");
    expect(globalStyles).not.toContain(
      "height: max(874px, calc(100dvh - 48px));",
    );
  });

  it("sizes assistant overlays against the assistant frame", () => {
    expect(drawer).toContain("max-h-[88%]");
    expect(drawer).not.toContain("max-h-[88dvh]");
    expect(claimExtract).toContain("max-h-[calc(100%-32px)]");
    expect(claimExtract).not.toContain("max-h-[72dvh]");
  });

  it("gives the chat flex layout a definite frame height", () => {
    expect(chatShell).toContain(
      'className="relative h-dvh w-full overflow-hidden',
    );
    expect(chatShell).toContain(
      'className="relative z-10 mx-auto flex h-full w-full max-w-phone',
    );
    expect(chatShell).not.toContain(
      'className="relative min-h-dvh w-full overflow-hidden',
    );
  });
});
