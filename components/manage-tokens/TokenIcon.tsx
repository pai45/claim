import type { CSSProperties } from "react";

export type TokenBrand = "apple" | "google" | "amazon" | "netflix" | "spotify";

interface TokenIconProps {
  brand: TokenBrand;
  className?: string;
  style?: CSSProperties;
}

export function TokenIcon({ brand, className = "", style }: TokenIconProps) {
  let content = null;
  let bgClass = "";

  switch (brand) {
    case "apple":
      bgClass = "bg-ink text-white";
      content = (
        <span className="flex items-center gap-0.5 text-xs font-bold tracking-tight">
          <span className="text-[14px]"></span>Pay
        </span>
      );
      break;
    case "google":
      bgClass = "bg-white border border-border-soft";
      // Simple representation of GPay logo using colors
      content = (
        <span className="flex items-center">
          <span className="text-blue-500 font-bold text-lg">G</span>
          <span className="text-ink font-semibold text-xs ml-0.5 mt-0.5">Pay</span>
        </span>
      );
      break;
    case "amazon":
      bgClass = "bg-[#ff9900] text-ink";
      content = <span className="font-bold text-2xl font-serif leading-none mt-1">a</span>;
      break;
    case "netflix":
      bgClass = "bg-black text-[#e50914]";
      content = <span className="font-bold text-3xl leading-none">N</span>;
      break;
    case "spotify":
      bgClass = "bg-[#f0f0f0] text-black";
      content = <span className="font-bold text-2xl leading-none">S</span>;
      break;
  }

  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-card ${bgClass} ${className}`}
      style={style}
    >
      {content}
    </div>
  );
}
