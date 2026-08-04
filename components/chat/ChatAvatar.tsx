import { BenefitsLogo } from "@/components/shared/BenefitsLogo";

type ChatAvatarProps = {
  className?: string;
};

export function ChatAvatar({ className = "" }: ChatAvatarProps) {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/35 ${className}`}
      aria-hidden
    >
      <BenefitsLogo size={28} />
    </span>
  );
}
