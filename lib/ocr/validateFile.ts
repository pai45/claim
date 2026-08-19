const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export function isPdf(file: File) {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

export function isImage(file: File) {
  return file.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(file.name);
}

export function isHeic(file: File) {
  return /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

/** `noun` is used in the error copy, e.g. "claim" -> "Please upload a claim…". */
export function validateDocumentFile(file: File, noun = "document"): string | null {
  if (file.size > MAX_BYTES) {
    return "File is too large. Please upload a file up to 10 MB.";
  }

  if (isHeic(file)) {
    return "HEIC photos aren't supported. Please upload a JPG or PNG, or take a new photo.";
  }

  if (!ALLOWED_TYPES.has(file.type) && !isPdf(file) && !isImage(file)) {
    return `Unsupported file type. Please use a PDF, JPG, or PNG of your ${noun}.`;
  }

  return null;
}
