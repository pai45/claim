import Image from "next/image";
import { withBasePath } from "@/lib/basePath";
import { BRAND_ASSETS } from "@/lib/ui/assets";

type BenefitsLogoProps = {
  size?: number;
  className?: string;
  label?: string;
};

export function BenefitsLogo({
  size = 64,
  className = "",
  label,
}: BenefitsLogoProps) {
  return (
    <span
      className={`block shrink-0 overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
      aria-hidden={label ? undefined : true}
    >
      <Image
        src={withBasePath(BRAND_ASSETS.logo)}
        alt={label ?? ""}
        width={size}
        height={size}
        className="block h-full w-full object-cover"
        unoptimized
      />
    </span>
  );
}
