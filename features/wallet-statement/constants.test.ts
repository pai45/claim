import { describe, expect, it } from "vitest";
import {
  filterWalletStatementTransactions,
  getWalletStatement,
  groupWalletStatementTransactions,
  isWalletStatementId,
} from "./constants";

describe("wallet statements", () => {
  it("resolves every wallet opened from the home overlay", () => {
    expect(["meal", "fuel", "misc", "gift"].every(isWalletStatementId)).toBe(true);
    expect(getWalletStatement("misc").label).toBe("Reimbursement Wallet");
  });

  it("falls back to the meal statement for an invalid query", () => {
    expect(getWalletStatement("unknown").id).toBe("meal");
  });

  it("filters by a native month value and keeps newest rows first", () => {
    const statement = getWalletStatement("meal");
    const august = filterWalletStatementTransactions(statement.transactions, "2026-08");
    const groups = groupWalletStatementTransactions(august);

    expect(august).toHaveLength(7);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("Current Month");
    expect(groups[0].transactions[0].postedOn).toBe("2026-08-28");
  });
});
