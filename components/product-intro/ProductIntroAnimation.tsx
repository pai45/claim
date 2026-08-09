"use client";

import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { useEffect, useRef, useState } from "react";
import { withBasePath } from "@/lib/basePath";
import { PRODUCT_INTRO_ASSETS } from "@/lib/ui/assets";

/** Mid-stride in the first scene, used when motion is reduced. */
const POSTER_FRAME = 18;

export default function ProductIntroAnimation() {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [animationData, setAnimationData] = useState<unknown>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(withBasePath(PRODUCT_INTRO_ASSETS.animation), {
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
        // The branded canvas remains usable if an asset is unavailable offline.
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
      assetsPath={withBasePath(PRODUCT_INTRO_ASSETS.images)}
      loop={!reduceMotion}
      autoplay={!reduceMotion}
      rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
      className="h-full w-full"
    />
  );
}
