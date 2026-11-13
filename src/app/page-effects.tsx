"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

const reveals = {
  curtain: { from: { y: 48, clipPath: "inset(0% 0% 100% 0%)" }, to: { y: 0, clipPath: "inset(0% 0% 0% 0%)", ease: "power4.out" } },
  drift: { from: { y: 54, scale: .96 }, to: { y: 0, scale: 1, ease: "power3.out" } },
  peel: { from: { scale: 1.08, clipPath: "inset(0% 70% 0% 0% round 36px)" }, to: { scale: 1, clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "power3.inOut" } },
  left: { from: { x: -65, y: 15 }, to: { x: 0, y: 0, ease: "expo.out" } },
  right: { from: { x: 65, y: 15 }, to: { x: 0, y: 0, ease: "expo.out" } },
  unfold: { from: { rotationX: 25, transformPerspective: 700, transformOrigin: "50% 100%", y: 20 }, to: { rotationX: 0, y: 0, ease: "power3.out" } },
  pop: { from: { scale: .8, y: 20 }, to: { scale: 1, y: 0, ease: "back.out(1.35)" } },
  iris: { from: { scale: .85, clipPath: "circle(12% at 50% 50%)" }, to: { scale: 1, clipPath: "circle(75% at 50% 50%)", ease: "power3.out" } },
} satisfies Record<string, { from: gsap.TweenVars; to: gsap.TweenVars }>;

type Shot = readonly [selector: string, effect: keyof typeof reveals, delay?: number];

const shots: readonly Shot[] = [
  [".brand-hero-copy .eyebrow, .brand-hero-copy p, .brand-hero-actions", "drift"],
  [".brand-hero h1", "curtain", .06],
  [".about-purpose-copy", "left"],
  [".about-purpose-photo", "peel", .1],
  [".about-benefits-heading", "drift"],
  [".about-benefit-list:first-child .about-benefit-card", "left"],
  [".about-benefit-list:last-child .about-benefit-card", "right", .08],
  [".about-benefits-cake", "pop", .12],
  [".founders-section > .content", "curtain"],
  [".founder-carousel", "pop", .05],
  [".business-subheading", "curtain"],
  [".audience-grid article", "unfold"],
  [".reference-giant-type", "curtain"],
  [".reference-hero-product", "pop", .1],
  [".reference-collection-copy", "unfold"],
  [".reference-side-stack, .reference-feature-left", "left"],
  [".reference-side-box, .reference-feature-right", "right", .08],
  [".reference-feature-image", "pop"],
  [".reference-catalog h4", "curtain"],
  [".catalog-picker", "unfold"],
  [".catalog-gallery", "drift", .1],
  [".identity-board-heading, .typography-heading", "curtain"],
  [".identity-row-label, .identity-name-band", "left"],
  [".identity-mark-card, .identity-color, .type-specimen", "unfold", .05],
  [".launch-feature", "unfold"],
  [".launch-support", "drift", .08],
  [".campaign-article-header", "curtain"],
  [".campaign-editorial-figure", "peel"],
  [".campaign-notes > section", "right", .08],
  [".campaign-color-circles > div", "pop", .12],
  [".closing-symbol", "iris"],
  [".closing h2", "curtain", .07],
  [".closing > p, .closing .pill, .credits, footer > *", "drift", .1],
];

const driftingMedia = ".about-purpose-photo > img, .reference-hero-product, .reference-feature-image img, .identity-mark-card img, .campaign-editorial-figure img";

export function PageEffects() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = document.documentElement;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const media = gsap.matchMedia();
    const scenes = document.querySelectorAll<HTMLElement>(".story-chapters, .identity-guide, .campaign-journal, .closing");
    const hero = document.querySelector<HTMLElement>(".hero-flight");

    let frame = 0;
    let started = false;

    function update() {
      frame = 0;
      const height = window.innerHeight;
      const page = Math.max(1, root.scrollHeight - height);
      const scrolled = window.scrollY > 22;
      const heroBottom = hero?.getBoundingClientRect().bottom ?? 0;
      root.toggleAttribute("data-page-scrolled", scrolled);
      root.toggleAttribute("data-hero-passed", scrolled && heroBottom < 64);
      root.style.setProperty("--film-progress", String(Math.min(1, Math.max(0, window.scrollY / page))));
      if (motion.matches) return;
      for (const scene of scenes) {
        const rect = scene.getBoundingClientRect();
        if (rect.top > height || rect.bottom < 0) continue;
        const phase = Math.max(-1, Math.min(1, (height / 2 - rect.top - rect.height / 2) / height));
        scene.style.setProperty("--film-phase", phase.toFixed(3));
        scene.style.setProperty("--film-offset", `${(phase * 40).toFixed(1)}px`);
      }
    }

    function requestUpdate() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    function startReveals() {
      if (started || root.hasAttribute("data-intro")) return;
      started = true;
      media.add("(prefers-reduced-motion: no-preference)", () => {
        if (hero) {
          const flight = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom bottom", scrub: .65 },
          });
          flight
            .to(".brand-hero-photo", { scale: 1.17, yPercent: 7 }, 0)
            .to(".brand-hero-inner", { y: -42 }, 0);
        }
        gsap.utils.toArray<HTMLElement>(driftingMedia).forEach((element, index) => {
          const distance = index % 2 === 0 ? 18 : -18;
          gsap.fromTo(element, { "--media-drift": `${distance}px` }, {
            "--media-drift": `${-distance}px`,
            ease: "none",
            scrollTrigger: { trigger: element, start: "top bottom", end: "bottom top", scrub: .7 },
          });
        });

        const animations = new Map<HTMLElement, gsap.core.Tween>();
        for (const [selector, effect, delay = 0] of shots) {
          const pose = reveals[effect];
          document.querySelectorAll<HTMLElement>(selector).forEach((element, index) => {
            animations.set(element, gsap.fromTo(element, { opacity: 0, ...pose.from }, {
              opacity: 1,
              ...pose.to,
              duration: effect === "peel" ? 1.2 : 1,
              delay: delay + (index % 4) * .075,
              clearProps: "opacity,transform,clipPath,transformOrigin",
              scrollTrigger: { trigger: element, start: "top 94%", once: true },
              onComplete: () => { animations.delete(element); },
            }));
          });
        }

        function revealFocus(event: FocusEvent) {
          if (!(event.target instanceof HTMLElement)) return;
          for (const [element, tween] of animations) {
            if (element.contains(event.target)) {
              tween.scrollTrigger?.kill(false, true);
              tween.progress(1);
            }
          }
        }

        document.addEventListener("focusin", revealFocus);
        return () => document.removeEventListener("focusin", revealFocus);
      });
    }

    startReveals();
    requestUpdate();
    window.addEventListener("formeslice:intro-end", startReveals);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    motion.addEventListener("change", requestUpdate);
    return () => {
      media.revert();
      window.cancelAnimationFrame(frame);
      root.removeAttribute("data-page-scrolled");
      root.removeAttribute("data-hero-passed");
      root.style.removeProperty("--film-progress");
      for (const scene of scenes) {
        scene.style.removeProperty("--film-phase");
        scene.style.removeProperty("--film-offset");
      }
      window.removeEventListener("formeslice:intro-end", startReveals);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      motion.removeEventListener("change", requestUpdate);
    };
  }, []);

  return null;
}
