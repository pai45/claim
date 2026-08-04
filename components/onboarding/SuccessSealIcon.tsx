import { colors } from "@/lib/ui/colors";

/** Scalloped verified seal used on onboarding success sheets. */
export function SuccessSealIcon({ size = 72 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="36" cy="36" r="36" fill="white" />
      <path
        d={SEAL_PATH}
        fill={colors.success}
      />
      <path
        d="M28.5 36.8 33.2 41.4 44 30.2"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 12-lobe scalloped disc centered at (36,36). */
const SEAL_PATH = (() => {
  const cx = 36;
  const cy = 36;
  const outer = 28;
  const inner = 24;
  const lobes = 12;
  const points: string[] = [];
  for (let i = 0; i < lobes * 2; i += 1) {
    const angle = (Math.PI * i) / lobes - Math.PI / 2;
    const radius = i % 2 === 0 ? outer : inner;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `${points.join(" ")} Z`;
})();
