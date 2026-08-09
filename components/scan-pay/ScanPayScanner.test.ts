import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ScanPayScanner } from "@/components/scan-pay/ScanPayScanner";
import { createInitialScanPayState } from "@/features/scan-pay/machine";

describe("ScanPayScanner", () => {
  it("renders aligned soft and sharp camera layers with accessible controls", () => {
    const markup = renderToStaticMarkup(
      createElement(ScanPayScanner, {
        state: createInitialScanPayState("success"),
        dispatch: vi.fn(),
        onClose: vi.fn(),
        detected: false,
      }),
    );

    expect(markup).toContain("scan-pay-scanner-image--soft");
    expect(markup).toContain("scan-pay-focus-window");
    expect(markup).toContain("scan-pay-scanner-image--sharp");
    expect(markup).toContain("scan-pay-beam");
    expect(markup).toContain(
      'alt="Pine Labs merchant QR on a payment terminal"',
    );
    expect(markup).toContain('alt=""');
    expect(markup).toContain('aria-label="Close Scan &amp; Pay"');
    expect(markup).toContain('aria-label="Scan &amp; Pay help"');
    expect(markup).toContain('aria-label="Toggle torch"');
    expect(markup).toContain('accept="image/*"');
    expect(markup).toContain("/assets/scan-pay/question-circle.svg");
    expect(markup).toContain("/assets/scan-pay/flashlight.svg");
    expect(markup).toContain("/assets/scan-pay/gallery.svg");
    expect(markup).toContain("Enter a UPI ID");
  });

  it("stops the beam and brightens both camera layers after torch and detection", () => {
    const state = {
      ...createInitialScanPayState("success"),
      torchEnabled: true,
    };
    const markup = renderToStaticMarkup(
      createElement(ScanPayScanner, {
        state,
        dispatch: vi.fn(),
        onClose: vi.fn(),
        detected: true,
      }),
    );

    expect(markup).toContain("is-torch-enabled");
    expect(markup).toContain("scan-pay-focus-window is-detected");
    expect(markup).toMatch(/scan-pay-beam[^\"]*is-detected/);
    expect(markup).toContain("QR code detected");
  });
});
