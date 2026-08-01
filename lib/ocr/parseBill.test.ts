import { describe, expect, it } from "vitest";
import { normalizeOcrText, parseBill } from "./parseBill";

describe("parseBill", () => {
  it("extracts clean Indian pharmacy bill fields", () => {
    const result = parseBill(
      "ACME Pharmacy\nGSTIN: 29AAAAA0000A1Z5\nDate: 12/03/2026\nInvoice No: INV-2026-118\nTotal: Rs 1,250.00\nThank you",
    );
    expect(result.vendor).toBe("ACME Pharmacy");
    expect(result.amount).toBe("₹1,250");
    expect(result.billDate).toBe("12 March 2026");
    expect(result.invoiceNo).toBe("INV-2026-118");
    expect(result.category).toBe("Medical");
  });

  it("reads amount on the next line after Grand Total", () => {
    const result = parseBill(
      "Apollo Clinic\nTax Invoice\nBill Date: 01-08-2026\nGrand Total\n2499.00",
    );
    expect(result.vendor).toBe("Apollo Clinic");
    expect(result.amount).toBe("₹2,499");
    expect(result.billDate).toBe("1 August 2026");
    expect(result.category).toBe("Medical");
  });

  it("handles noisy OCR label and currency misreads", () => {
    const noisy =
      "MEDPLUS STORE\nTax Invoice\nDa1e 08.07.2026\nInv No. MP/8821\nAmt Payable R5 640";
    expect(normalizeOcrText(noisy)).toMatch(/Date/i);
    expect(normalizeOcrText(noisy)).toMatch(/Rs/);

    const result = parseBill(noisy);
    expect(result.vendor).toBe("MEDPLUS STORE");
    expect(result.amount).toBe("₹640");
    expect(result.invoiceNo).toBe("MP/8821");
    expect(result.category).toBe("Medical");
  });

  it("handles glued TotalRs amounts", () => {
    const result = parseBill(
      "Airtel Broadband\nInvoice Number: AB/2026/00991\nBill Date 28/07/2026\nTotalRs.999",
    );
    expect(result.amount).toBe("₹999");
    expect(result.invoiceNo).toBe("AB/2026/00991");
    expect(result.category).toBe("Internet & Broadband");
  });

  it("extracts fuel receipt fields", () => {
    const result = parseBill(
      "Indian Oil Petrol Pump\nDate 15/07/2026\nFuel Diesel\nAmount Payable Rs.2,180.50\nReceipt No IOC/77821",
    );
    expect(result.vendor).toContain("Indian Oil");
    expect(result.amount).toBe("₹2,180.50");
    expect(result.invoiceNo).toBe("IOC/77821");
    expect(result.category).toBe("Fuel");
  });

  it("does not put tax lines into Amount when Total exists", () => {
    const result = parseBill(
      "City Care Clinic\nInvoice No: CC/9021\nBill Date: 02/08/2026\nCGST Amount: 90.00\nSGST Amount: 90.00\nTotal Amount: Rs 1,180.00",
    );
    expect(result.amount).toBe("₹1,180");
    expect(result.invoiceNo).toBe("CC/9021");
    expect(result.billDate).toBe("2 August 2026");
  });

  it("does not put Amount value into Invoice No", () => {
    const result = parseBill(
      "Swiggy\nOrder #SW12345\nDate: 5 Aug 2026\nTotal Amount ₹ 486",
    );
    expect(result.amount).toBe("₹486");
    expect(result.invoiceNo).toBe("SW12345");
    expect(result.invoiceNo).not.toBe("486");
    expect(result.billDate).toBe("5 August 2026");
  });

  it("does not put bill date into Invoice No", () => {
    const result = parseBill(
      "Fresh Mart\nBill Date: 11/06/2026\nTotal: Rs 320\nThank you",
    );
    expect(result.billDate).toBe("11 June 2026");
    expect(result.amount).toBe("₹320");
    expect(result.invoiceNo).toBeUndefined();
  });

  it("keeps numeric invoice ids out of Amount when Total is present", () => {
    const result = parseBill(
      "Office Depot\nInvoice No: 784512\nDate: 09/07/2026\nTotal Amount: Rs 2,450",
    );
    expect(result.invoiceNo).toBe("784512");
    expect(result.amount).toBe("₹2,450");
  });
});
