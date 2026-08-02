import { USER_DISPLAY_NAME } from "@/features/chat/constants";
import { AppIcon } from "@/components/shared/AppIcon";
import { BRAND_ASSETS } from "@/lib/ui/assets";

type ChatAvatarProps = {
  role: "user" | "assistant";
  className?: string;
};

function userInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export function ChatAvatar({ role, className = "" }: ChatAvatarProps) {
  if (role === "assistant") {
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

  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pine-primary text-[11px] font-bold leading-none text-white shadow-soft ${className}`}
      aria-hidden
    >
      {userInitials(USER_DISPLAY_NAME)}
    </span>
  );
}
