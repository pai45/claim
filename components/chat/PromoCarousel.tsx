"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { BannerCardContent } from "@/features/chat/bannerCards";
import { staggerStyle } from "@/lib/ui/staggerStyle";
import { NotificationBannerCard } from "./NotificationBannerCard";
import { PromoCard } from "./PromoCard";

/**
 * How long the scroll settles before the active dot moves. Ported from the
 * wallet carousel in the legacy prototype (public/employee-benefits/app.js).
 */
const SCROLL_SETTLE_MS = 90;

/** Below this, a mouse press is a click on the card's CTA, not a drag. */
const DRAG_THRESHOLD_PX = 6;

type PromoCarouselProps = {
  cards: BannerCardContent[];
  onVehicleStart: () => void;
  onUploadBill: () => void;
  disabled?: boolean;
  reduceMotion?: boolean;
};

type DragState = {
  pointerId: number;
  startX: number;
  startScrollLeft: number;
  /** Flips once the pointer travels past the threshold. */
  moved: boolean;
};

export function PromoCarousel({
  cards,
  onVehicleStart,
  onUploadBill,
  disabled,
  reduceMotion,
}: PromoCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<DragState | null>(null);
  /** Set by a finished drag so the click it generates never reaches a CTA. */
  const suppressClick = useRef(false);

  // A lone card has nothing to scroll to, so it fills the width and neither
  // drag nor dots apply.
  const canScroll = cards.length > 1;

  /** The slide whose centre sits nearest the track's centre wins. */
  const nearestIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;

    const trackCentre = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let smallest = Number.POSITIVE_INFINITY;

    Array.from(track.children).forEach((child, index) => {
      const slide = child as HTMLElement;
      const centre = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(centre - trackCentre);
      if (distance < smallest) {
        smallest = distance;
        nearest = index;
      }
    });

    return nearest;
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const slide = trackRef.current?.children[index] as HTMLElement | undefined;
      // `start` rather than `center`: the slides are snap-start, so centring
      // here would leave the browser to drag the card back afterwards.
      slide?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        inline: "start",
        block: "nearest",
      });
      setActiveIndex(index);
    },
    [reduceMotion],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setActiveIndex(nearestIndex()), SCROLL_SETTLE_MS);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      if (timer) clearTimeout(timer);
    };
  }, [nearestIndex]);

  // A new stage means a new set of cards, which must open on the first one.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollLeft = 0;
    setActiveIndex(0);
  }, [cards]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    // A fresh press always earns a fresh click, even if the last drag ended
    // somewhere that never produced one.
    suppressClick.current = false;
    // Touch and pen already scroll natively, with momentum this cannot match;
    // only a mouse needs the drag.
    if (!canScroll || event.pointerType !== "mouse" || event.button !== 0) {
      return;
    }
    const track = trackRef.current;
    if (!track) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: track.scrollLeft,
      moved: false,
    };
    setDragging(true);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || !track || event.pointerId !== drag.pointerId) return;

    const delta = event.clientX - drag.startX;
    if (!drag.moved) {
      if (Math.abs(delta) < DRAG_THRESHOLD_PX) return;
      drag.moved = true;
      // Captured only once this is genuinely a drag, so an ordinary press
      // still lands on the button underneath.
      track.setPointerCapture(event.pointerId);
    }
    track.scrollLeft = drag.startScrollLeft - delta;
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || !track || event.pointerId !== drag.pointerId) return;

    dragRef.current = null;
    setDragging(false);
    if (track.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
    if (!drag.moved) return;

    suppressClick.current = true;
    // Snap is off during the drag, so settle the release by hand.
    goTo(nearestIndex());
  }

  function handleClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <div
      className="animate-rise-in flex flex-col pt-0.5"
      style={{ animationDelay: "240ms" }}
    >
      <div
        ref={trackRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="Updates"
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClickCapture={handleClickCapture}
        // pb-2 keeps the cards' bottom-right shadow out of the overflow clip.
        className={`flex snap-x items-stretch gap-3 overflow-x-auto overscroll-x-contain scroll-px-page px-page pb-2 touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          canScroll ? "cursor-grab" : ""
        } ${
          // Snapping has to stand down while scrollLeft is driven by hand,
          // otherwise it fights every frame of the drag.
          dragging ? "cursor-grabbing snap-none select-none" : "snap-mandatory"
        }`}
      >
        {cards.map((card, index) => (
          <div
            key={card.id}
            // A single card fills the frame; more than one narrows so the next
            // card peeks past the right edge and reads as swipeable.
            className={`animate-rise-in flex shrink-0 snap-start ${
              canScroll ? "w-[86%]" : "w-full"
            }`}
            style={staggerStyle(index)}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${cards.length}`}
          >
            {card.id === "vehicle_registration" ? (
              <PromoCard
                card={card}
                onStart={onVehicleStart}
                disabled={disabled}
              />
            ) : (
              <NotificationBannerCard
                card={card}
                onUploadBill={onUploadBill}
                disabled={disabled}
              />
            )}
          </div>
        ))}
      </div>

      {canScroll ? (
        <div className="flex items-center justify-center gap-1 pt-1.5">
          {cards.map((card, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Go to update ${index + 1}`}
                aria-current={isActive}
                // 24px hit area: a 44px target would dominate a dot row, and
                // swiping the track stays the primary way to move between cards.
                className="flex h-6 w-6 items-center justify-center"
              >
                <span
                  aria-hidden
                  className={`h-1.75 rounded-pill transition-[width,background-color] duration-180 ease-out ${
                    isActive ? "w-7 bg-pine-primary" : "w-1.75 bg-border-muted"
                  }`}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
