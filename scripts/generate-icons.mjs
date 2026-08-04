/**
 * Renders the Benefits Assistant app mark to every PNG size the Expo shell and
 * the PWA manifest need.
 *
 * The mark is the four-square claims glyph from
 * `public/assets/icons/claims-dashboard.svg`, redrawn as plain rounded rects so
 * it stays crisp at 1024px, with the lower-right square filled in mint.
 *
 * Run after changing the mark or brand colours:
 *
 *   node scripts/generate-icons.mjs
 *
 * Requires `sharp`, which ships transitively with Next.js image optimisation.
 * Generated PNGs are committed, so this is not part of the build.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Keep in sync with lib/ui/colors.ts.
const PINE_DARK = "#003434";
const MINT = "#36CC8B";
const SURFACE = "#F8FAF8";

// Glyph geometry as ratios of the mark's outer box, so it scales cleanly.
const R = {
  stroke: 34 / 434,
  offset1: 17 / 434,
  offset2: 241 / 434,
  square: 176 / 434,
  radius: 44 / 434,
  fillOffset: 224 / 434,
  fillSquare: 210 / 434,
  fillRadius: 61 / 434,
};

/**
 * @param {object} options
 * @param {number} options.size Canvas edge in px.
 * @param {number} options.glyph Mark's outer edge in px.
 * @param {string | null} options.background Canvas fill, or null for transparent.
 * @param {string} options.stroke Outline colour of the three open squares.
 * @param {string} options.accent Fill colour of the lower-right square.
 */
function markSvg({ size, glyph, background, stroke, accent }) {
  const origin = (size - glyph) / 2;
  const px = (ratio) => (ratio * glyph).toFixed(2);
  const at = (ratio) => (origin + ratio * glyph).toFixed(2);

  const open = (xRatio, yRatio) =>
    `<rect x="${at(xRatio)}" y="${at(yRatio)}" width="${px(R.square)}" ` +
    `height="${px(R.square)}" rx="${px(R.radius)}" fill="none" ` +
    `stroke="${stroke}" stroke-width="${px(R.stroke)}"/>`;

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
      (background
        ? `<rect width="${size}" height="${size}" fill="${background}"/>`
        : "") +
      open(R.offset1, R.offset1) +
      open(R.offset2, R.offset1) +
      open(R.offset1, R.offset2) +
      `<rect x="${at(R.fillOffset)}" y="${at(R.fillOffset)}" ` +
      `width="${px(R.fillSquare)}" height="${px(R.fillSquare)}" ` +
      `rx="${px(R.fillRadius)}" fill="${accent}"/>` +
      `</svg>`,
  );
}

const onPine = { background: PINE_DARK, stroke: "#FFFFFF", accent: MINT };
const transparentOnDark = { background: null, stroke: "#FFFFFF", accent: MINT };

/** @type {Array<{ file: string, size: number, glyph: number } & Record<string, unknown>>} */
const targets = [
  // Expo shell.
  { file: "mobile/assets/icon.png", size: 1024, glyph: 512, ...onPine },
  {
    file: "mobile/assets/android-icon-foreground.png",
    size: 1024,
    glyph: 600,
    ...transparentOnDark,
  },
  {
    file: "mobile/assets/android-icon-background.png",
    size: 1024,
    glyph: 0,
    background: PINE_DARK,
    stroke: "none",
    accent: "none",
  },
  {
    file: "mobile/assets/android-icon-monochrome.png",
    size: 1024,
    glyph: 600,
    background: null,
    stroke: "#FFFFFF",
    accent: "#FFFFFF",
  },
  // Splash sits on the light surface colour, so the mark inverts.
  {
    file: "mobile/assets/splash-icon.png",
    size: 512,
    glyph: 420,
    background: null,
    stroke: PINE_DARK,
    accent: MINT,
  },
  { file: "mobile/assets/favicon.png", size: 48, glyph: 40, ...onPine },

  // PWA. `any` icons keep a tight crop; the maskable one pads for the safe zone.
  { file: "public/assets/pwa/icon-192.png", size: 192, glyph: 128, ...onPine },
  { file: "public/assets/pwa/icon-512.png", size: 512, glyph: 340, ...onPine },
  {
    file: "public/assets/pwa/icon-maskable-512.png",
    size: 512,
    glyph: 256,
    ...onPine,
  },
  // iOS home screen icons are composited on white, so they must be opaque.
  {
    file: "public/assets/pwa/apple-touch-icon.png",
    size: 180,
    glyph: 116,
    ...onPine,
  },
];

for (const { file, ...options } of targets) {
  const outputPath = path.join(root, file);
  mkdirSync(path.dirname(outputPath), { recursive: true });

  const image = sharp(markSvg(options));
  // Opaque marks drop the alpha channel outright: the App Store rejects iOS
  // icons that carry one, and Android maskable icons must not be see-through.
  if (options.background) image.flatten({ background: options.background });

  await image.png({ compressionLevel: 9 }).toFile(outputPath);
  console.log(`wrote ${file}`);
}

console.log(`\nSurface colour for splash/manifest background: ${SURFACE}`);
