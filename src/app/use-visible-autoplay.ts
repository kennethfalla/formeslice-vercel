"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";

export function useVisibleAutoplay(ref: RefObject<HTMLElement | null>, advance: () => void, delay = 5000) {
  const onAdvance = useEffectEvent(advance);
  useEffect(() => {
    const target = ref.current;
    if (!target) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let timer: number | undefined;

    function sync() {
      window.clearInterval(timer);
      if (visible && !document.hidden && !motion.matches) timer = window.setInterval(onAdvance, delay);
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(target);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [ref, delay]);
}
