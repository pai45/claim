"use client";

import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { useEffect, useRef, useState } from "react";
import { withBasePath } from "@/lib/basePath";

/**
 * Mid-composition. Four layers (Car, Plane, bill, cart) are time-reversed
 * (`sr: -1`), so the final frame is not guaranteed to show every element —
 * `totalFrames - 1` would leave holes in the still.
 */
const POSTER_FRAME = 30;

export default function LoginBackground() {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [animationData, setAnimationData] = useState<unknown>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Fetched rather than imported: a static import would inline all 361 KB into
  // the login chunk. From `public/` it stays a plain asset the service worker
  // caches on its own.
  useEffect(() => {
    const controller = new AbortController();

    fetch(withBasePath("/assets/login/login-animation.json"), {
      signal: controller.signal,
      cache: "force-cache",
    })
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error(String(response.status))),
      )
      .then(setAnimationData)
      .catch(() => {
        // Leave the flat canvas. Login must stay usable offline or on a 404.
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const lottie = lottieRef.current;
    if (!lottie || !animationData) return;

    if (reduceMotion) lottie.goToAndStop(POSTER_FRAME, true);
    else lottie.play();
  }, [animationData, reduceMotion]);

  // A looping animation should not burn CPU behind another tab.
  useEffect(() => {
    if (reduceMotion) return;

    const sync = () => {
      const lottie = lottieRef.current;
      if (!lottie) return;
      if (document.hidden) lottie.pause();
      else lottie.play();
    };

    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [reduceMotion]);

  if (!animationData) return null;

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={!reduceMotion}
      autoplay={!reduceMotion}
      // `slice` fills the band at any height; anchored to the top so the UPI
      // badge and the floating category icons stay in frame when the keyboard
      // shrinks it.
      rendererSettings={{ preserveAspectRatio: "xMidYMin slice" }}
      className="h-full w-full"
    />
  );
}
