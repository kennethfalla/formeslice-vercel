"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { SyrupEdge } from "./syrup-edge";

const logo = "/images/details/Secondarylogo.png";

export function BrandIntro() {
  const skip = useRef<HTMLButtonElement>(null);
  const finish = useCallback(() => {
    const root = document.documentElement;
    if (!root.hasAttribute("data-intro")) return;
    const restoreFocus = document.activeElement === skip.current;
    delete root.dataset.intro;
    const site = document.querySelector<HTMLElement>(".site-shell");
    if (site) site.inert = false;
    if (restoreFocus) document.getElementById("main")?.focus({ preventScroll: true });
    window.dispatchEvent(new Event("formeslice:intro-end"));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer = 0;
    const activate = () => {
      const site = document.querySelector<HTMLElement>(".site-shell");
      if (site) site.inert = true;
      skip.current?.focus({ preventScroll: true });
      window.clearTimeout(timer);
      timer = window.setTimeout(finish, 5400);
    };
    const replay = () => {
      if (motion.matches || root.hasAttribute("data-intro")) return;
      root.dataset.intro = String(Date.now());
      activate();
    };
    const onKey = (event: KeyboardEvent) => {
      if (!root.hasAttribute("data-intro")) return;
      if (event.key === "Escape") finish();
      if (event.key === "Tab") { event.preventDefault(); skip.current?.focus(); }
    };
    const onMotion = () => { if (motion.matches) finish(); };
    if (root.hasAttribute("data-intro")) activate();
    window.addEventListener("formeslice:replay-intro", replay);
    window.addEventListener("keydown", onKey);
    motion.addEventListener("change", onMotion);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("formeslice:replay-intro", replay);
      window.removeEventListener("keydown", onKey);
      motion.removeEventListener("change", onMotion);
      const site = document.querySelector<HTMLElement>(".site-shell");
      if (site) site.inert = false;
    };
  }, [finish]);

  return <div className="icing-intro" role="dialog" aria-modal="true" aria-label="ForméSlice introduction" onAnimationEnd={event => {
    if (event.target === event.currentTarget && event.animationName === "icing-exit") finish();
  }}>
    <SyrupEdge className="icing-pour" glossy />
    <div className="icing-stream" aria-hidden="true" />
    <div className="icing-mark">
      <div className="icing-melt" aria-hidden="true"><span /><span /><span /></div>
      <div className="icing-logo">
        <span className="icing-logo-fill" aria-hidden="true" />
        <Image src={logo} width={514} height={918} alt="ForméSlice secondary logo" loading="eager" sizes="150px" />
      </div>
    </div>
    <button className="icing-skip" ref={skip} onClick={finish}>Skip intro <ArrowRight size={15} aria-hidden="true" /></button>
  </div>;
}
