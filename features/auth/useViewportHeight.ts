"use client";

import { useEffect } from "react";

export const VIEWPORT_HEIGHT_VAR = "--login-viewport-height";

/**
 * Publishes the *visual* viewport height as a CSS variable while mounted.
 *
 * `100dvh` deliberately ignores the on-screen keyboard (the default
 * `interactiveWidget=resizes-visual`), so a bottom-anchored sheet ends up
 * underneath it. Reading `visualViewport` instead lets the login screen shrink
 * to the space the keyboard leaves, without changing the global `viewport`
 * export and with it the chat composer's tuned behaviour.
 */
export function useViewportHeight(): void {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const root = document.documentElement;
    const sync = () => {
      root.style.setProperty(VIEWPORT_HEIGHT_VAR, `${viewport.height}px`);
    };

    sync();
    viewport.addEventListener("resize", sync);
    return () => {
      viewport.removeEventListener("resize", sync);
      root.style.removeProperty(VIEWPORT_HEIGHT_VAR);
    };
  }, []);
}
