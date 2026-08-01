import { parseRc, type ParsedRc } from "./parseRc";
import { isPdf, validateDocumentFile } from "./validateFile";

export type RcOcrResult = ParsedRc & {
  fileName: string;
  rawText: string;
  error?: string;
  warning?: string;
};

/** Enough of the vehicle to show the user something worth confirming. */
function hasIdentity(rc: ParsedRc): boolean {
  return Boolean(rc.maker || rc.model);
}

export async function runRcOcr(file: File): Promise<RcOcrResult> {
  const validationError = validateDocumentFile(file, "RC");
  if (validationError) {
    return { fileName: file.name, rawText: "", confidence: 0, error: validationError };
  }

  let source: Blob = file;

  if (isPdf(file)) {
    const { pdfFileToImageBlob } = await import("./pdfToImage");
    source = await pdfFileToImageBlob(file);
  }

  const { preprocessImageForOcr } = await import("./preprocessImage");
  source = await preprocessImageForOcr(source);

  const { createWorker, PSM } = await import("tesseract.js");
  const worker = await createWorker("eng", 1);

  try {
    await worker.setParameters({
      // RC cards are label/value tables, not prose — SPARSE_TEXT keeps columns
      // from being stitched into one line, which breaks label matching.
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      preserve_interword_spaces: "1",
    });

    const result = await worker.recognize(source);
    const rawText = result.data.text?.trim() ?? "";

    if (!rawText) {
      return {
        fileName: file.name,
        rawText: "",
        confidence: 0,
        error: "Could not read anything from that image. Try a clearer, straight-on photo of the RC.",
      };
    }

    const rc = parseRc(rawText);

    return {
      ...rc,
      fileName: file.name,
      rawText,
      ...(hasIdentity(rc)
        ? {}
        : {
            warning:
              "I read the document but couldn't pick out the maker and model. Please enter them below.",
          }),
    };
  } finally {
    await worker.terminate();
  }
}
