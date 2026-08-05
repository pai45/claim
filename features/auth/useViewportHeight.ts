"use client";

import { useEffect } from "react";

export const VIEWPORT_HEIGHT_VAR = "--login-viewport-height";
export const VIEWPORT_OFFSET_VAR = "--login-viewport-offset";

/**
 * Publishes the *visual* viewport geometry as CSS variables while mounted.
 *
 * Height, because `100dvh` deliberately ignores the on-screen keyboard (the
 * default `interactiveWidget=resizes-visual`), so a bottom-anchored sheet ends
 * up underneath it. Reading `visualViewport` lets the login screen shrink to
 * the space the keyboard leaves without changing the global `viewport` export
 * and with it the chat composer's tuned behaviour.
 *
 * Offset, because the browser scrolls the document to reveal a focused input
 * before the resize even fires. An in-flow screen gets dragged up with it —
 * the logo bar leaves the top of the display — and iOS does not reliably
 * re-clamp the scroll afterwards. `.login-viewport` pins itself against these
 * variables so document scroll cannot move it and a panned visual viewport is
 * compensated for.
 */
export function useViewportHeight(): void {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const root = document.documentElement;
    const sync = () => {
      root.style.setProperty(VIEWPORT_HEIGHT_VAR, `${viewport.height}px`);
      root.style.setProperty(VIEWPORT_OFFSET_VAR, `${viewport.offsetTop}px`);
    };

    sync();
    viewport.addEventListener("resize", sync);
    viewport.addEventListener("scroll", sync);
    return () => {
      viewport.removeEventListener("resize", sync);
      viewport.removeEventListener("scroll", sync);
      root.style.removeProperty(VIEWPORT_HEIGHT_VAR);
      root.style.removeProperty(VIEWPORT_OFFSET_VAR);
    };
  }, []);
}
