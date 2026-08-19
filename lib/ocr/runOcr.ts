import { parseClaim, type ParsedClaimFields } from "./parseClaim";
import { isPdf, validateDocumentFile } from "./validateFile";
import type { ClaimExtract } from "@/features/chat/types";

export function validateClaimFile(file: File): string | null {
  return validateDocumentFile(file, "claim");
}

function filledFieldCount(fields: ParsedClaimFields): number {
  return [fields.amount, fields.vendor, fields.claimDate, fields.invoiceNo].filter(
    Boolean,
  ).length;
}

function hasUsefulFields(fields: ParsedClaimFields): boolean {
  return filledFieldCount(fields) > 0;
}

function scoreOcrPass(
  text: string,
  confidence: number,
  fields: ParsedClaimFields,
): number {
  const fieldsFilled = filledFieldCount(fields);
  return (
    fieldsFilled * 40 +
    (fields.amount ? 25 : 0) +
    confidence * 0.35 +
    Math.min(30, text.length / 40)
  );
}

type OcrPass = {
  rawText: string;
  confidence: number;
  fields: ParsedClaimFields;
  score: number;
};

type WorkerLike = {
  setParameters: (params: Record<string, string>) => Promise<unknown>;
  recognize: (image: Blob) => Promise<{
    data: { text?: string; confidence?: number };
  }>;
  terminate: () => Promise<unknown>;
};

async function recognizeOnce(
  worker: WorkerLike,
  source: Blob,
  mode: string,
): Promise<OcrPass> {
  await worker.setParameters({
    tessedit_pageseg_mode: mode,
    preserve_interword_spaces: "1",
    load_system_dawg: "0",
    load_freq_dawg: "0",
    user_defined_dpi: "300",
  });

  const result = await worker.recognize(source);
  const rawText = result.data.text?.trim() ?? "";
  const fields = parseClaim(rawText);
  const confidence =
    typeof result.data.confidence === "number" ? result.data.confidence : 0;

  return {
    rawText,
    confidence,
    fields,
    score: rawText ? scoreOcrPass(rawText, confidence, fields) : 0,
  };
}

function isStrongPass(pass: OcrPass): boolean {
  return filledFieldCount(pass.fields) >= 3 && pass.confidence >= 50;
}

async function recognizeBest(sourceBlob: Blob): Promise<OcrPass> {
  const { createWorker, PSM } = await import("tesseract.js");
  const { preprocessImageForOcr } = await import("./preprocessImage");
  const worker = (await createWorker("eng", 1)) as unknown as WorkerLike;

  let best: OcrPass = {
    rawText: "",
    confidence: 0,
    fields: {},
    score: 0,
  };

  try {
    const binary = await preprocessImageForOcr(sourceBlob, "binary");

    // Pass 1: single-column on binarized image (typical receipt)
    const p1 = await recognizeOnce(worker, binary, PSM.SINGLE_COLUMN);
    if (p1.score > best.score) best = p1;
    if (isStrongPass(best)) return best;

    // Pass 2: auto page-seg on binarized image
    const p2 = await recognizeOnce(worker, binary, PSM.AUTO);
    if (p2.score > best.score) best = p2;
    if (isStrongPass(best) || best.score >= 120) return best;

    // Pass 3: grayscale fallback (thin fonts / clean screenshots)
    const gray = await preprocessImageForOcr(sourceBlob, "gray");
    const p3 = await recognizeOnce(worker, gray, PSM.SINGLE_COLUMN);
    if (p3.score > best.score) best = p3;
    if (isStrongPass(best) || best.score >= 120) return best;

    // Pass 4: sparse text catches awkward multi-column totals
    const p4 = await recognizeOnce(worker, gray, PSM.SPARSE_TEXT);
    if (p4.score > best.score) best = p4;
  } finally {
    await worker.terminate();
  }

  return best;
}

export async function runClaimOcr(file: File): Promise<ClaimExtract> {
  const validationError = validateClaimFile(file);
  if (validationError) {
    return {
      fileName: file.name,
      rawText: "",
      error: validationError,
    };
  }

  // Digital PDF text layer — far more accurate than OCR when present
  if (isPdf(file)) {
    try {
      const { extractPdfText } = await import("./pdfExtractText");
      const pdfText = await extractPdfText(file);
      if (pdfText) {
        const fields = parseClaim(pdfText);
        return {
          fileName: file.name,
          rawText: pdfText,
          confidence: 98,
          ...fields,
          ...(hasUsefulFields(fields)
            ? {}
            : {
                warning:
                  "I read the PDF text but couldn't map every claim field. Please review and edit before submitting.",
              }),
        };
      }
    } catch (err) {
      console.warn("PDF text extraction failed, falling back to OCR", err);
    }
  }

  let source: Blob = file;
  if (isPdf(file)) {
    const { pdfFileToImageBlob } = await import("./pdfToImage");
    source = await pdfFileToImageBlob(file);
  }

  const pass = await recognizeBest(source);

  if (!pass.rawText) {
    return {
      fileName: file.name,
      rawText: "",
      confidence: pass.confidence,
      error:
        "Could not read any text from this claim. Try a clearer, well-lit photo.",
    };
  }

  return {
    fileName: file.name,
    rawText: pass.rawText,
    confidence: pass.confidence,
    ...pass.fields,
    ...(hasUsefulFields(pass.fields)
      ? {}
      : {
          warning:
            "I could read the claim but couldn't pick out every detail. Please review and edit before submitting.",
        }),
  };
}
