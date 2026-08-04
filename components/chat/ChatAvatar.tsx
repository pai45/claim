import { AppIcon } from "@/components/shared/AppIcon";
import { BRAND_ASSETS } from "@/lib/ui/assets";

type ChatAvatarProps = {
  className?: string;
};

export function ChatAvatar({ className = "" }: ChatAvatarProps) {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/35 ${className}`}
      aria-hidden
    >
      <AppIcon
        src={BRAND_ASSETS.logo}
        alt=""
        size={28}
        className="object-contain"
      />
    </span>
  );
}
