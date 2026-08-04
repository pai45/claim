"use client";

import { useEffect } from "react";
import { withBasePath } from "@/lib/basePath";

/**
 * Registers the service worker that makes the app installable and lets it open
 * offline. Renders nothing.
 *
 * Development is skipped on purpose: a worker caching `npm run dev` output
 * makes edits appear not to take effect.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register(withBasePath("/sw.js"), { scope: withBasePath("/") })
        .catch(() => {
          // Blocked by private browsing or an unsupported host. The app works
          // fine without it, so there is nothing to report.
        });
    };

    // Registering after load keeps the worker's install fetches from competing
    // with the page's own first paint.
    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
