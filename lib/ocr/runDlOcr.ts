import { parseDl } from "./parseDl";
import { isPdf, validateDocumentFile } from "./validateFile";
import type { DriverSalaryPayload } from "@/features/chat/types";

export function validateDlFile(file: File): string | null {
  return validateDocumentFile(file, "driving licence");
}

type DlOcrPass = {
  rawText: string;
  confidence: number;
  dlNumber?: string;
  warning?: string;
  score: number;
};

type WorkerLike = {
  setParameters: (params: Record<string, string>) => Promise<unknown>;
  recognize: (image: Blob) => Promise<{
    data: { text?: string; confidence?: number };
  }>;
  terminate: () => Promise<unknown>;
};

function scorePass(pass: Omit<DlOcrPass, "score">): number {
  return (
    (pass.dlNumber ? 100 : 0) +
    pass.confidence * 0.35 +
    Math.min(20, pass.rawText.length / 50)
  );
}

async function recognizeOnce(
  worker: WorkerLike,
  source: Blob,
  mode: string,
): Promise<DlOcrPass> {
  await worker.setParameters({
    tessedit_pageseg_mode: mode,
    preserve_interword_spaces: "1",
    load_system_dawg: "0",
    load_freq_dawg: "0",
    user_defined_dpi: "300",
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -/:",
  });

  const result = await worker.recognize(source);
  const rawText = result.data.text?.trim() ?? "";
  const fields = parseDl(rawText);
  const confidence =
    typeof result.data.confidence === "number" ? result.data.confidence : 0;
  const base = {
    rawText,
    confidence,
    dlNumber: fields.dlNumber,
    warning: fields.warning,
  };

  return { ...base, score: rawText ? scorePass(base) : 0 };
}

async function recognizeBest(sourceBlob: Blob): Promise<DlOcrPass> {
  const { createWorker, PSM } = await import("tesseract.js");
  const { preprocessImageForOcr } = await import("./preprocessImage");
  const worker = (await createWorker("eng", 1)) as unknown as WorkerLike;

  let best: DlOcrPass = {
    rawText: "",
    confidence: 0,
    score: 0,
  };

  try {
    const binary = await preprocessImageForOcr(sourceBlob, "binary");

    const p1 = await recognizeOnce(worker, binary, PSM.SINGLE_COLUMN);
    if (p1.score > best.score) best = p1;
    if (best.dlNumber && best.confidence >= 45) return best;

    const p2 = await recognizeOnce(worker, binary, PSM.AUTO);
    if (p2.score > best.score) best = p2;
    if (best.dlNumber && best.confidence >= 45) return best;

    const gray = await preprocessImageForOcr(sourceBlob, "gray");
    const p3 = await recognizeOnce(worker, gray, PSM.SPARSE_TEXT);
    if (p3.score > best.score) best = p3;
  } finally {
    await worker.terminate();
  }

  return best;
}

export type DlOcrResult = Pick<
  DriverSalaryPayload,
  | "dlFileName"
  | "dlNumber"
  | "dlRawText"
  | "dlConfidence"
  | "dlError"
  | "dlWarning"
>;

export async function runDlOcr(file: File): Promise<DlOcrResult> {
  const validationError = validateDlFile(file);
  if (validationError) {
    return {
      dlFileName: file.name,
      dlRawText: "",
      dlError: validationError,
    };
  }

  if (isPdf(file)) {
    try {
      const { extractPdfText } = await import("./pdfExtractText");
      const pdfText = await extractPdfText(file);
      if (pdfText) {
        const fields = parseDl(pdfText);
        return {
          dlFileName: file.name,
          dlRawText: pdfText,
          dlConfidence: 98,
          dlNumber: fields.dlNumber,
          dlWarning: fields.dlNumber
            ? undefined
            : fields.warning ||
              "Could not find a driving licence number in this PDF.",
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
      dlFileName: file.name,
      dlRawText: "",
      dlConfidence: pass.confidence,
      dlError:
        "Could not read any text from this licence. Try a clearer, well-lit photo.",
    };
  }

  if (!pass.dlNumber) {
    return {
      dlFileName: file.name,
      dlRawText: pass.rawText,
      dlConfidence: pass.confidence,
      dlWarning:
        pass.warning ||
        "I couldn't find a driving licence number. Please enter it manually.",
    };
  }

  return {
    dlFileName: file.name,
    dlRawText: pass.rawText,
    dlConfidence: pass.confidence,
    dlNumber: pass.dlNumber,
  };
}
