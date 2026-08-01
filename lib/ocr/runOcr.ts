import { parseBill } from "./parseBill";
import { isPdf, validateDocumentFile } from "./validateFile";
import type { BillExtract } from "@/features/chat/types";

export function validateBillFile(file: File): string | null {
  return validateDocumentFile(file, "bill");
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
