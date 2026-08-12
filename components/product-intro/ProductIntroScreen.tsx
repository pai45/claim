"use client";

import dynamic from "next/dynamic";
import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { PlusPayWordmark } from "@/components/login/PlusPayWordmark";
import { AppShell } from "@/components/shared/AppShell";
import {
  PRODUCT_INTRO_LAST_INDEX,
  PRODUCT_INTRO_SLIDES,
  nextProductIntroIndex,
  resolveProductIntroSwipe,
} from "@/features/product-intro/controller";
import { colors } from "@/lib/ui/colors";

const ProductIntroAnimation = dynamic(
  () => import("@/components/product-intro/ProductIntroAnimation"),
  { ssr: false },
);

type ProductIntroScreenProps = {
  onComplete: () => void;
};

type PointerStart = {
  id: number;
  x: number;
  y: number;
};

const RING_RADIUS = 29;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function isInteractiveTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest("button, a, input, select, textarea") !== null
  );
}

export function ProductIntroScreen({ onComplete }: ProductIntroScreenProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const pointerStartRef = useRef<PointerStart | null>(null);

  const slide = PRODUCT_INTRO_SLIDES[slideIndex];
  const isLastSlide = slideIndex === PRODUCT_INTRO_LAST_INDEX;
  const ringProgress = (slideIndex + 1) / PRODUCT_INTRO_SLIDES.length;
  const ringOffset = RING_CIRCUMFERENCE * (1 - ringProgress);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (isInteractiveTarget(event.target)) return;
    pointerStartRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start || start.id !== event.pointerId) return;

    setSlideIndex((current) =>
      resolveProductIntroSwipe(
        current,
        event.clientX - start.x,
        event.clientY - start.y,
      ),
    );
  }

  function handlePrimaryAction() {
    if (isLastSlide) {
      onComplete();
      return;
    }
    setSlideIndex((current) => nextProductIntroIndex(current));
  }

  return (
    <AppShell variant="login" className="login-viewport overflow-hidden">
      <div
        className="relative flex min-h-0 flex-1 touch-pan-y flex-col overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          pointerStartRef.current = null;
        }}
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <ProductIntroAnimation />
        </div>

        <header className="relative z-10 flex min-h-20 shrink-0 items-center justify-center border-b border-border-line bg-login-canvas px-page pt-[env(safe-area-inset-top)]">
          <PlusPayWordmark />
          {!isLastSlide ? (
            <button
              type="button"
              onClick={onComplete}
              className="absolute right-4 flex min-h-11 items-center rounded-pill px-2 text-body font-bold text-pine-dark"
            >
              Skip
            </button>
          ) : null}
        </header>

        <div className="relative min-h-0 flex-1" aria-hidden="true" />

        <footer className="relative z-10 mx-page mb-[max(16px,env(safe-area-inset-bottom))] flex min-h-60 shrink-0 flex-col items-center rounded-bubble bg-white px-6 pb-6 pt-8 shadow-card">
          <div
            role="status"
            aria-label={`Slide ${slideIndex + 1} of ${PRODUCT_INTRO_SLIDES.length}`}
            className="absolute left-1/2 top-0 flex h-4 -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-pill bg-pine-primary px-2"
          >
            {PRODUCT_INTRO_SLIDES.map((item, index) => (
              <span
                key={item.id}
                className={
                  index === slideIndex
                    ? "h-1.5 w-10 rounded-pill bg-white"
                    : "h-2 w-2 rounded-pill border border-white"
                }
              />
            ))}
          </div>

          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${slideIndex + 1} of ${PRODUCT_INTRO_SLIDES.length}`}
            aria-live="polite"
            className="animate-rise-in flex min-h-24 flex-col items-center text-center"
          >
            <h1 className="type-screen-title">{slide.title}</h1>
            <p className="mt-2 type-body-secondary max-w-card">
              {slide.description}
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrimaryAction}
            aria-label={
              isLastSlide
                ? "Get started"
                : `Next: ${PRODUCT_INTRO_SLIDES[slideIndex + 1].title}`
            }
            className={
              isLastSlide
                ? "btn-primary mt-auto"
                : "relative mt-auto flex h-16 w-16 items-center justify-center rounded-pill text-white"
            }
          >
            {isLastSlide ? (
              "Get started"
            ) : (
              <>
                <svg
                  viewBox="0 0 64 64"
                  className="absolute inset-0 h-full w-full -rotate-90"
                  aria-hidden="true"
                >
                  <circle
                    cx="32"
                    cy="32"
                    r={RING_RADIUS}
                    fill="none"
                    stroke={colors.borderMuted}
                    strokeWidth="4"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r={RING_RADIUS}
                    fill="none"
                    stroke={colors.mint}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={ringOffset}
                  />
                </svg>
                <span className="absolute inset-1 rounded-pill bg-pine-primary shadow-cta" />
                <svg
                  viewBox="0 0 24 24"
                  className="relative h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </>
            )}
          </button>
        </footer>
      </div>
    </AppShell>
  );
}
