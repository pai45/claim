import { parseBill } from "./parseBill";
import type { BillExtract } from "@/features/chat/types";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function isPdf(file: File) {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

function isImage(file: File) {
  return (
    file.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(file.name)
  );
}

function isHeic(file: File) {
  return (
    /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)
  );
}

export function validateBillFile(file: File): string | null {
  if (file.size > MAX_BYTES) {
    return "File is too large. Please upload a file up to 10 MB.";
  }

  if (isHeic(file)) {
    return "HEIC photos aren't supported. Please upload a JPG or PNG, or take a new photo.";
  }

  if (!ALLOWED_TYPES.has(file.type) && !isPdf(file) && !isImage(file)) {
    return "Unsupported file type. Please use PDF, JPG, or PNG.";
  }

  return null;
}

function hasUsefulFields(fields: ReturnType<typeof parseBill>): boolean {
  return Boolean(
    fields.amount || fields.vendor || fields.billDate || fields.invoiceNo,
  );
}

export async function runBillOcr(file: File): Promise<BillExtract> {
  const validationError = validateBillFile(file);
  if (validationError) {
    return {
      fileName: file.name,
      rawText: "",
      error: validationError,
    };
  }

  let source: Blob = file;

  if (isPdf(file)) {
    const { pdfFileToImageBlob } = await import("./pdfToImage");
    source = await pdfFileToImageBlob(file);
  }

  const { preprocessImageForOcr } = await import("./preprocessImage");
  source = await preprocessImageForOcr(source);

  const { createWorker, PSM } = await import("tesseract.js");
  // OEM 1 = LSTM only; CDN defaults from tesseract.js avoid Next.js worker bundling issues
  const worker = await createWorker("eng", 1);

  try {
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
      preserve_interword_spaces: "1",
    });

    const result = await worker.recognize(source);
    const rawText = result.data.text?.trim() ?? "";
    const fields = parseBill(rawText);

    if (!rawText) {
      return {
        fileName: file.name,
        rawText: "",
        confidence: result.data.confidence,
        error: "Could not read any text from this bill. Try a clearer photo.",
      };
    }

    return {
      fileName: file.name,
      rawText,
      confidence: result.data.confidence,
      ...fields,
      // Keep the form editable; surface a soft hint only when key fields are empty
      ...(hasUsefulFields(fields)
        ? {}
        : {
            warning:
              "I could read the bill but couldn't pick out every detail. Please review and edit before submitting.",
          }),
    };
  } finally {
    await worker.terminate();
  }
}
