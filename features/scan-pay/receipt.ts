import type { ScanPayTransaction } from "@/features/scan-pay/types";
import { maskAccountNumber } from "@/features/bank-transfer/validation";
import { colors } from "@/lib/ui/colors";

export function formatScanPayINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export function buildScanPayReceiptText(transaction: ScanPayTransaction): string {
  const payee = transaction.payee;
  const bankTransfer = payee.kind === "bank-transfer";
  return [
    receiptTitle(transaction),
    `${formatScanPayINR(transaction.amount)} paid to ${payee.name}`,
    `Status: ${statusLabel(transaction.outcome)}`,
    payee.kind === "bank-transfer"
      ? `Account: ${maskAccountNumber(payee.accountNumber)}`
      : payee.kind === "upi"
        ? `UPI ID: ${payee.upiId}`
        : `Merchant ID: ${payee.merchantId}`,
    payee.kind === "bank-transfer"
      ? `IFSC: ${payee.ifsc}`
      : `UPI Transaction ID: ${transaction.transactionId}`,
    bankTransfer ? `Reference ID: ${transaction.transactionId}` : "",
    `Payment method: ${transaction.paymentMethod}`,
    ...fundingTextLines(transaction),
    `Date & time: ${transaction.dateTime}`,
    `Category: ${transaction.category ?? "Not specified"}${transaction.subcategory ? ` / ${transaction.subcategory}` : ""}`,
    transaction.note ? `Note: ${transaction.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function downloadScanPayReceipt(
  transaction: ScanPayTransaction,
): Promise<void> {
  const blob = await createScanPayReceiptImage(transaction);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = receiptFilename(transaction);
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 0);
}

export async function shareScanPayReceipt(
  transaction: ScanPayTransaction,
): Promise<"shared" | "copied" | "cancelled"> {
  const text = buildScanPayReceiptText(transaction);
  const blob = await createScanPayReceiptImage(transaction);
  const file = new File([blob], receiptFilename(transaction), {
    type: "image/png",
  });

  try {
    if (navigator.share) {
      const canShareFile = navigator.canShare?.({ files: [file] }) ?? false;
      await navigator.share({
        title: receiptTitle(transaction),
        text,
        ...(canShareFile ? { files: [file] } : {}),
      });
      return "shared";
    }
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "cancelled";
    }
    await navigator.clipboard.writeText(text);
    return "copied";
  }
}

export async function createScanPayReceiptImage(
  transaction: ScanPayTransaction,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1480;
  const context = canvas.getContext("2d");
  if (!context) {
    return new Blob([buildScanPayReceiptText(transaction)], {
      type: "text/plain",
    });
  }

  context.fillStyle = colors.white;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = colors.pinePrimary;
  context.fillRect(0, 0, canvas.width, 330);

  context.textAlign = "center";
  context.fillStyle = colors.white;
  context.font = "700 50px 'PP Telegraf', 'Lato', sans-serif";
  context.fillText(
    transaction.payee.kind === "bank-transfer"
      ? "EB+ Bank Transfer"
      : transaction.mode === "benefits"
        ? "EB+"
        : "PlusPay",
    canvas.width / 2,
    105,
  );
  context.font = "700 76px 'PP Telegraf', 'Lato', sans-serif";
  context.fillText(formatScanPayINR(transaction.amount), canvas.width / 2, 215);
  context.font = "600 30px 'Lato', sans-serif";
  context.fillText(`Paid to ${transaction.payee.name}`, canvas.width / 2, 275);

  const rows = receiptRows(transaction);
  context.textAlign = "left";
  rows.forEach(([label, value], index) => {
    const y = 420 + index * 116;
    context.fillStyle = colors.inkSecondary;
    context.font = "500 26px 'Lato', sans-serif";
    context.fillText(label, 88, y);
    context.fillStyle = colors.ink;
    context.font = "700 28px 'Lato', sans-serif";
    context.textAlign = "right";
    context.fillText(value, 992, y);
    context.strokeStyle = colors.borderMuted;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(88, y + 44);
    context.lineTo(992, y + 44);
    context.stroke();
    context.textAlign = "left";
  });

  context.textAlign = "center";
  context.fillStyle = colors.pinePrimary;
  context.font = "700 28px 'Lato', sans-serif";
  context.fillText(
    transaction.payee.kind === "bank-transfer"
      ? "Paid securely with EB+"
      : "Payments powered by UPI",
    canvas.width / 2,
    1370,
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) =>
        resolve(
          blob ??
            new Blob([buildScanPayReceiptText(transaction)], {
              type: "text/plain",
            }),
        ),
      "image/png",
      0.92,
    );
  });
}

export function receiptRows(
  transaction: ScanPayTransaction,
): [string, string][] {
  const fundingRows: [string, string][] =
    transaction.fundingAllocations.length > 0
      ? transaction.fundingAllocations.map((allocation) => [
          `Paid from ${allocation.walletLabel}`,
          formatScanPayINR(allocation.amount),
        ])
      : [["Paid From", transaction.walletLabel]];
  const identityRows: [string, string][] =
    transaction.payee.kind === "bank-transfer"
      ? [
          ["Account", maskAccountNumber(transaction.payee.accountNumber)],
          ["IFSC", transaction.payee.ifsc],
          ["Reference ID", transaction.transactionId],
        ]
      : transaction.payee.kind === "upi"
        ? [
            ["UPI ID", compactValue(transaction.payee.upiId)],
            ["UPI Transaction ID", transaction.transactionId],
          ]
        : [
          ["Merchant ID", compactValue(transaction.payee.merchantId)],
          ["UPI Transaction ID", transaction.transactionId],
        ];
  return [
    ["Status", statusLabel(transaction.outcome)],
    ...identityRows,
    ["Payment Method", transaction.paymentMethod],
    ...fundingRows,
    ["Date & Time", transaction.dateTime],
    [
      "Category",
      transaction.category
        ? `${transaction.category}${transaction.subcategory ? ` / ${transaction.subcategory}` : ""}`
        : "Not specified",
    ],
  ];
}

export function paymentPayeeIdentifier(
  transaction: ScanPayTransaction,
): string {
  return transaction.payee.kind === "bank-transfer"
    ? `A/C ${maskAccountNumber(transaction.payee.accountNumber)} · IFSC ${transaction.payee.ifsc}`
    : transaction.payee.upiId;
}

function fundingTextLines(transaction: ScanPayTransaction): string[] {
  if (transaction.fundingAllocations.length === 0) {
    return [`Paid from: ${transaction.walletLabel}`];
  }
  return transaction.fundingAllocations.map(
    (allocation) =>
      `Paid from ${allocation.walletLabel}: ${formatScanPayINR(allocation.amount)}`,
  );
}

export function statusLabel(outcome: ScanPayTransaction["outcome"]): string {
  if (outcome === "failed") return "Failed";
  if (outcome === "processing") return "Processing";
  return "Success";
}

function compactValue(value: string): string {
  return value.length > 24 ? `${value.slice(0, 21)}…` : value;
}

function receiptFilename(transaction: ScanPayTransaction): string {
  const prefix =
    transaction.payee.kind === "bank-transfer"
      ? "bank-transfer"
      : transaction.mode === "benefits"
        ? "eb-plus-upi"
        : "pluspay";
  return `${prefix}-${transaction.transactionId}.png`;
}

function receiptTitle(transaction: ScanPayTransaction): string {
  if (transaction.payee.kind === "bank-transfer") {
    return "EB+ bank transfer receipt";
  }
  return transaction.mode === "benefits"
    ? "EB+ UPI payment receipt"
    : "PlusPay payment receipt";
}
