"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BenefitsLogo } from "@/components/shared/BenefitsLogo";
import { withBasePath } from "@/lib/basePath";

type EbBottomNavProps = {
  active?: "home" | "benefits" | "transactions";
  className?: string;
  /**
   * Visually retires the bar without unmounting it, so the host can fade it
   * out while a full-screen surface takes over.
   */
  hidden?: boolean;
  /**
   * Opens the Benefits Assistant in place. Screens that own the assistant pass
   * this; the rest fall back to linking at `/#claims`, which opens it on load.
   */
  onBenefits?: () => void;
};

const NAV_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 402 139' preserveAspectRatio='none'%3E%3Cpath d='M0 52H130C160 52 166 88 201 88C236 88 242 52 272 52H402V139H0Z' fill='%23fff' stroke='%23dce3e0' stroke-width='.7'/%3E%3C/svg%3E\")";

export function EbBottomNav({
  active,
  className = "",
  hidden = false,
  onBenefits,
}: EbBottomNavProps) {
  const pathname = usePathname();
  const current =
    active ??
    (pathname?.includes("transaction") ? "transactions" : "home");

  // Laid out exactly like the Home and Transactions tabs, so the label picks up
  // the same type and lands on the same line by construction rather than by a
  // hand-set offset that has to be kept in step with them.
  const benefitsClassName = `relative flex min-h-[139px] flex-col items-center justify-start gap-2 px-2 pb-[11px] pt-[67px] text-caption font-normal leading-[1.2] ${
    current === "benefits" ? "text-pine-primary" : "text-[#595e70]"
  }`;
  const benefitsContent = (
    <>
      {/*
        The Benefits button floats above the bar, so the flow keeps a stand-in
        the size of the other tabs' icons in its place.
      */}
      <span className="block h-[22px] w-[22px]" aria-hidden="true" />
      <span className="absolute left-1/2 top-[18px] grid h-[60px] w-[60px] -translate-x-1/2 place-items-center overflow-hidden rounded-full bg-white shadow-[0_5px_12px_rgba(0,86,86,0.1),0_0_10px_rgba(151,226,196,0.16)]">
        <BenefitsLogo size={40} />
      </span>
      <span className="max-w-[82px] overflow-hidden text-ellipsis whitespace-nowrap">
        Benefits
      </span>
    </>
  );

  return (
    <nav
      className={`relative z-20 mx-auto grid h-[calc(139px+env(safe-area-inset-bottom,0px))] w-full max-w-phone shrink-0 grid-cols-3 items-start overflow-visible pb-[env(safe-area-inset-bottom,0px)] ${className}`.trim()}
      aria-label="Primary navigation"
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
    >
      {/*
        The artwork is 139px tall by design and the icons, button and labels are
        all positioned from the top of that 139px box. Letting it stretch over
        the safe-area inset as well pushed the surface and its notch down while
        the content stayed put, so the inset is excluded here — the white below
        it is painted by the nav's own background instead.
      */}
      <div
        className="pointer-events-none absolute inset-0 bottom-[env(safe-area-inset-bottom,0px)] -z-10 drop-shadow-[0_-1px_2px_rgba(0,52,52,0.06)]"
        style={{
          backgroundImage: NAV_BG,
          backgroundPosition: "center bottom",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[env(safe-area-inset-bottom,0px)] bg-white"
        aria-hidden="true"
      />

      <Link
        href="/"
        className={`flex min-h-[139px] flex-col items-center justify-start gap-2 px-2.5 pb-[11px] pt-[67px] text-caption font-normal leading-[1.2] ${
          current === "home" ? "text-pine-primary" : "text-subtle"
        }`}
        aria-current={current === "home" ? "page" : undefined}
      >
        <NavIcon
          src="/employee-benefits/assets/icons/home.svg"
          active={current === "home"}
        />
        <span>Home</span>
      </Link>

      <Link
        href="/#claims"
        className={benefitsClassName}
        aria-label="Benefits"
        aria-current={current === "benefits" ? "page" : undefined}
        onClick={
          onBenefits
            ? (event) => {
                event.preventDefault();
                onBenefits();
              }
            : undefined
        }
      >
        {benefitsContent}
      </Link>

      <Link
        href="/transactions/"
        className={`flex min-h-[139px] flex-col items-center justify-start gap-2 px-2.5 pb-[11px] pt-[67px] text-caption font-normal leading-[1.2] ${
          current === "transactions" ? "text-pine-primary" : "text-subtle"
        }`}
        aria-current={current === "transactions" ? "page" : undefined}
      >
        <NavIcon
          src="/employee-benefits/assets/icons/transaction-history.svg"
          active={current === "transactions"}
        />
        <span className="max-w-[92px] overflow-hidden text-ellipsis">
          Transactions
        </span>
      </Link>
    </nav>
  );
}

function NavIcon({ src, active }: { src: string; active: boolean }) {
  const iconUrl = `url("${withBasePath(src)}")`;

  return (
    <span
      className={`block h-[22px] w-[22px] ${
        active ? "bg-pine-primary" : "bg-subtle"
      }`}
      style={{
        WebkitMaskImage: iconUrl,
        maskImage: iconUrl,
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "22px 22px",
        maskSize: "22px 22px",
      }}
      aria-hidden="true"
    />
  );
}
