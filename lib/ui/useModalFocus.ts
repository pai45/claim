"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useModalFocus(
  containerRef: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
) {
  const onCloseRef = useRef(onClose);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.inert = !open;
    if (!open) {
      wasOpenRef.current = false;
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      );

    // Only steal focus when the dialog opens — not on parent re-renders.
    const justOpened = !wasOpenRef.current;
    wasOpenRef.current = true;
    if (justOpened) {
      window.requestAnimationFrame(() => focusable()[0]?.focus());
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const elements = focusable();
      if (elements.length === 0) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [containerRef, open]);
}
