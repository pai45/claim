/**
 * Upscale small photos and boost contrast so Tesseract can read phone-camera bills.
 */
export async function preprocessImageForOcr(source: Blob): Promise<Blob> {
  if (typeof window === "undefined" || typeof createImageBitmap === "undefined") {
    return source;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(source);
  } catch {
    return source;
  }

  const maxSide = Math.max(bitmap.width, bitmap.height);
  // Upscale small / blurry phone shots; cap huge images for speed
  let scale = 1;
  if (maxSide < 900) scale = 2.2;
  else if (maxSide < 1400) scale = 1.5;
  else if (maxSide > 2800) scale = 2200 / maxSide;

  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    bitmap.close();
    return source;
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;

  // Grayscale + mild contrast stretch helps receipt text
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const contrasted = Math.min(
      255,
      Math.max(0, (gray - 128) * 1.35 + 128),
    );
    data[i] = contrasted;
    data[i + 1] = contrasted;
    data[i + 2] = contrasted;
  }

  ctx.putImageData(image, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );

  return blob ?? source;
}
