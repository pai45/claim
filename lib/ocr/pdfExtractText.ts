type TextItem = {
  str?: string;
  transform?: number[];
  width?: number;
  height?: number;
};

function configurePdfWorker(pdfjs: {
  version: string;
  GlobalWorkerOptions: { workerSrc: string };
}) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

/**
 * Rebuild readable line-oriented text from pdf.js text items using Y positions.
 * Digital invoices become near-perfect input for parseClaim — no OCR needed.
 */
function reconstructPageText(items: TextItem[]): string {
  const rows: { y: number; parts: { x: number; text: string }[] }[] = [];

  for (const item of items) {
    const text = item.str?.trim();
    if (!text || !item.transform) continue;
    const x = item.transform[4] ?? 0;
    const y = Math.round((item.transform[5] ?? 0) * 2) / 2;

    const existing = rows.find((row) => Math.abs(row.y - y) < 3);
    if (existing) {
      existing.parts.push({ x, text });
    } else {
      rows.push({ y, parts: [{ x, text }] });
    }
  }

  // PDF Y grows upward
  rows.sort((a, b) => b.y - a.y);

  return rows
    .map((row) =>
      row.parts
        .sort((a, b) => a.x - b.x)
        .map((part) => part.text)
        .join(" "),
    )
    .join("\n");
}

/**
 * Returns embedded PDF text when the file is a digital invoice.
 * Returns null for scanned/image-only PDFs so the caller can OCR instead.
 */
export async function extractPdfText(file: File): Promise<string | null> {
  if (typeof window === "undefined") {
    throw new Error("PDF text extraction is only available in the browser");
  }

  const pdfjs = await import("pdfjs-dist");
  configurePdfWorker(pdfjs);

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const maxPages = Math.min(pdf.numPages, 2);
  const pages: string[] = [];

  for (let pageNum = 1; pageNum <= maxPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = reconstructPageText(content.items as TextItem[]);
    if (pageText.trim()) pages.push(pageText.trim());
  }

  const text = pages.join("\n\n").trim();
  const compact = text.replace(/\s+/g, "");

  // Scanned PDFs often have empty/tiny text layers
  if (compact.length < 40) return null;

  // Prefer text that looks like a claim document (has digits + a few letters)
  const digitCount = (compact.match(/\d/g) ?? []).length;
  const letterCount = (compact.match(/[a-zA-Z]/g) ?? []).length;
  if (digitCount < 4 || letterCount < 8) return null;

  return text;
}
