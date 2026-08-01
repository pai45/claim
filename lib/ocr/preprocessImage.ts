function boxBlurGray(
  src: Float32Array,
  width: number,
  height: number,
  radius: number,
): Float32Array {
  const dest = new Float32Array(src.length);
  const window = radius * 2 + 1;
  const inv = 1 / window;

  // Horizontal
  const tmp = new Float32Array(src.length);
  for (let y = 0; y < height; y += 1) {
    let sum = 0;
    const row = y * width;
    for (let x = -radius; x <= radius; x += 1) {
      sum += src[row + Math.min(width - 1, Math.max(0, x))];
    }
    for (let x = 0; x < width; x += 1) {
      tmp[row + x] = sum * inv;
      const remove = src[row + Math.min(width - 1, Math.max(0, x - radius))];
      const add = src[row + Math.min(width - 1, Math.max(0, x + radius + 1))];
      sum += add - remove;
    }
  }

  // Vertical
  for (let x = 0; x < width; x += 1) {
    let sum = 0;
    for (let y = -radius; y <= radius; y += 1) {
      sum += tmp[Math.min(height - 1, Math.max(0, y)) * width + x];
    }
    for (let y = 0; y < height; y += 1) {
      dest[y * width + x] = sum * inv;
      const remove =
        tmp[Math.min(height - 1, Math.max(0, y - radius)) * width + x];
      const add =
        tmp[Math.min(height - 1, Math.max(0, y + radius + 1)) * width + x];
      sum += add - remove;
    }
  }

  return dest;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.round((p / 100) * (sorted.length - 1))),
  );
  return sorted[idx];
}

export type PreprocessMode = "binary" | "gray";

async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

function withWhiteBorder(
  sourceCanvas: HTMLCanvasElement,
  pad = 24,
): HTMLCanvasElement {
  const bordered = document.createElement("canvas");
  bordered.width = sourceCanvas.width + pad * 2;
  bordered.height = sourceCanvas.height + pad * 2;
  const bctx = bordered.getContext("2d");
  if (!bctx) return sourceCanvas;
  bctx.fillStyle = "#ffffff";
  bctx.fillRect(0, 0, bordered.width, bordered.height);
  bctx.drawImage(sourceCanvas, pad, pad);
  return bordered;
}

/**
 * Upscale + lighting normalize + sharpen, optionally adaptively binarize.
 * `binary` helps uneven phone photos; `gray` is safer for clean screenshots.
 */
export async function preprocessImageForOcr(
  source: Blob,
  mode: PreprocessMode = "binary",
): Promise<Blob> {
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
  // Target ~1800–2400px on the long side (roughly 250–300 DPI for A4 phone shots)
  let scale = 1;
  if (maxSide < 1000) scale = 2.4;
  else if (maxSide < 1500) scale = 1.8;
  else if (maxSide < 2000) scale = 1.35;
  else if (maxSide > 3200) scale = 2400 / maxSide;

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
  const { data } = image;
  const pixelCount = width * height;
  const gray = new Float32Array(pixelCount);

  let lumaSum = 0;
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    const value = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    gray[p] = value;
    lumaSum += value;
  }

  // Invert dark receipts / night-mode screenshots (white text on dark)
  const meanLuma = lumaSum / pixelCount;
  if (meanLuma < 110) {
    for (let p = 0; p < pixelCount; p += 1) gray[p] = 255 - gray[p];
  }

  // Percentile contrast stretch (robust to glare/shadows)
  const sample: number[] = [];
  const step = Math.max(1, Math.floor(pixelCount / 8000));
  for (let p = 0; p < pixelCount; p += step) sample.push(gray[p]);
  sample.sort((a, b) => a - b);
  const low = percentile(sample, 5);
  const high = percentile(sample, 95);
  const span = Math.max(1, high - low);
  for (let p = 0; p < pixelCount; p += 1) {
    gray[p] = Math.min(255, Math.max(0, ((gray[p] - low) / span) * 255));
  }

  // Unsharp mask — crisp glyph edges help LSTM OCR a lot
  const blurred = boxBlurGray(gray, width, height, 1);
  for (let p = 0; p < pixelCount; p += 1) {
    const sharp = gray[p] + 1.2 * (gray[p] - blurred[p]);
    gray[p] = Math.min(255, Math.max(0, sharp));
  }

  if (mode === "binary") {
    const radius = Math.max(8, Math.round(Math.min(width, height) * 0.02));
    const localMean = boxBlurGray(gray, width, height, radius);
    const bias = 8;
    for (let p = 0, i = 0; p < pixelCount; p += 1, i += 4) {
      const value = gray[p] < localMean[p] - bias ? 0 : 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
  } else {
    for (let p = 0, i = 0; p < pixelCount; p += 1, i += 4) {
      const value = Math.round(gray[p]);
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  const bordered = withWhiteBorder(canvas);
  return (await canvasToPngBlob(bordered)) ?? source;
}
