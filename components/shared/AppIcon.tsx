import Image from "next/image";
import { withBasePath } from "@/lib/basePath";

type AppIconProps = {
  src: string;
  alt?: string;
  size?: number;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
};

export function AppIcon({
  src,
  alt = "",
  size = 24,
  width,
  height,
  className,
  priority,
}: AppIconProps) {
  return (
    <Image
      src={withBasePath(src)}
      alt={alt}
      width={width ?? size}
      height={height ?? size}
      className={className}
      priority={priority}
      unoptimized
    />
  );
}
