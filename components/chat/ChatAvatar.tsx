import { AppIcon } from "@/components/shared/AppIcon";
import { BRAND_ASSETS } from "@/lib/ui/assets";

type ChatAvatarProps = {
  className?: string;
};

export function ChatAvatar({ className = "" }: ChatAvatarProps) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-soft ring-1 ring-border-soft ${className}`}
      aria-hidden
    >
      <AppIcon
        src={BRAND_ASSETS.logo}
        alt=""
        size={20}
        className="object-contain"
      />
    </span>
  );
}
