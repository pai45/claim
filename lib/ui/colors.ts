/**
 * Design-system color constants for non-Tailwind contexts (SVG stroke/fill, MagicText).
 * Keep in sync with @theme tokens in app/globals.css.
 */
export const colors = {
  white: "#FFFFFF",
  pine: "#0F3F37",
  pinePrimary: "#005656",
  pineDark: "#003434",
  mint: "#36CC8B",
  ink: "#1C2725",
  inkSecondary: "#667A74",
  inkTertiary: "#8D92A3",
  muted: "#8A9D99",
  subtle: "#535862",
  borderMuted: "#DFE5E2",
  success: "#279E6C",
  warning: "#B25E00",
  danger: "#7A2E24",
  driverSalary: "#745C53",
  /** Soft mint accents used by ColorBends background */
  mintSoft: "#9DDBC1",
  mintWash: "#E7F4EE",
  /** Login screen canvas — matches the login Lottie's own backdrop layer. */
  loginCanvas: "#DBF5E7",
  surfaceMuted: "#E8EBE9",
} as const;
