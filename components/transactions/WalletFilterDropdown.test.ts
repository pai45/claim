import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WalletFilterDropdown } from "./WalletFilterDropdown";

describe("WalletFilterDropdown", () => {
  it("renders trigger button with active wallet label", () => {
    const markup = renderToStaticMarkup(
      createElement(WalletFilterDropdown, {
        selectedWallet: "meal",
        onSelectWallet: () => {},
      }),
    );

    expect(markup).toContain("Meal Wallet");
    expect(markup).toContain('aria-haspopup="listbox"');
    expect(markup).toContain('aria-expanded="false"');
  });

  it("updates trigger label for other wallets", () => {
    const fuelMarkup = renderToStaticMarkup(
      createElement(WalletFilterDropdown, {
        selectedWallet: "fuel",
        onSelectWallet: () => {},
      }),
    );
    expect(fuelMarkup).toContain("Fuel Wallet");

    const reimbursementMarkup = renderToStaticMarkup(
      createElement(WalletFilterDropdown, {
        selectedWallet: "misc",
        onSelectWallet: () => {},
      }),
    );
    expect(reimbursementMarkup).toContain("Reimbursement Wallet");
  });
});
