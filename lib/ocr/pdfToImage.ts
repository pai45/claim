export async function pdfFileToImageBlob(file: File): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("PDF conversion is only available in the browser");
  }

  const pdfjs = await import("pdfjs-dist");

  // CDN worker is more reliable under Next.js bundlers than import.meta.url
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const page = await pdf.getPage(1);
  // Higher scale improves OCR on text-heavy invoices
  const viewport = page.getViewport({ scale: 2.5 });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not create canvas for PDF rendering");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: context, viewport, canvas }).promise;

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );

  if (!blob) {
    throw new Error("Could not convert PDF page to image");
  }

  return blob;
}
