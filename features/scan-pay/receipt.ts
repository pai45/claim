import type { ScanPayTransaction } from "@/features/scan-pay/types";
import { colors } from "@/lib/ui/colors";

export function formatScanPayINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export function buildScanPayReceiptText(transaction: ScanPayTransaction): string {
  return [
    "PlusPay payment receipt",
    `${formatScanPayINR(transaction.amount)} paid to ${transaction.merchant}`,
    `Status: ${statusLabel(transaction.outcome)}`,
    `Merchant ID: ${transaction.merchantId}`,
    `UPI Transaction ID: ${transaction.transactionId}`,
    `Payment method: ${transaction.paymentMethod}`,
    `Paid from: ${transaction.walletLabel}`,
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
  link.download = `pluspay-${transaction.transactionId}.png`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 0);
}

export async function shareScanPayReceipt(
  transaction: ScanPayTransaction,
): Promise<"shared" | "copied" | "cancelled"> {
  const text = buildScanPayReceiptText(transaction);
  const blob = await createScanPayReceiptImage(transaction);
  const file = new File([blob], `pluspay-${transaction.transactionId}.png`, {
    type: "image/png",
  });

  try {
    if (navigator.share) {
      const canShareFile = navigator.canShare?.({ files: [file] }) ?? false;
      await navigator.share({
        title: "PlusPay payment receipt",
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
  context.fillText("PlusPay", canvas.width / 2, 105);
  context.font = "700 76px 'PP Telegraf', 'Lato', sans-serif";
  context.fillText(formatScanPayINR(transaction.amount), canvas.width / 2, 215);
  context.font = "600 30px 'Lato', sans-serif";
  context.fillText(`Paid to ${transaction.merchant}`, canvas.width / 2, 275);

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
  context.fillText("Payments powered by UPI", canvas.width / 2, 1370);

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
  return [
    ["Status", statusLabel(transaction.outcome)],
    ["Merchant ID", compactValue(transaction.merchantId)],
    ["UPI Transaction ID", transaction.transactionId],
    ["Payment Method", transaction.paymentMethod],
    ["Paid From", transaction.walletLabel],
    ["Date & Time", transaction.dateTime],
    [
      "Category",
      transaction.category
        ? `${transaction.category}${transaction.subcategory ? ` / ${transaction.subcategory}` : ""}`
        : "Not specified",
    ],
  ];
}

export function statusLabel(outcome: ScanPayTransaction["outcome"]): string {
  if (outcome === "failed") return "Failed";
  if (outcome === "processing") return "Processing";
  return "Success";
}

function compactValue(value: string): string {
  return value.length > 24 ? `${value.slice(0, 21)}…` : value;
}
