"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { flavors, storyCakeFlavors } from "./cake-recipe";
import type { StoryCakePose } from "./story-cake-scene";

const CakeScene = dynamic(() => import("./story-cake-scene").then(module => module.StoryCakeScene), { ssr: false });

const chapters = [
  { id: "beginning", image: "AboutUs1.webp", width: 600, height: 600, position: "center 64%", title: "A sweeter beginning.", short: "The beginning", alt: "A baker in a pink apron decorating a cake", copy: "ForméSlice began with a simple gap: cake buyers often have to choose from fixed flavors and designs. We imagined a more personal experience—one where your preferences help shape the cake." },
  { id: "name", image: "AboutUs2.webp", width: 673, height: 1024, position: "center 58%", title: "A name made to create.", short: "The name", alt: "A baker mixing ingredients in a large bowl", copy: "“Form” means forming or creating. “Slice” is the cake itself. Together, ForméSlice expresses our “Create Your Own Slice” idea: a cake shaped by your taste, your choices, and your own arrangement." },
  { id: "freedom", image: "AboutUs3.webp", width: 735, height: 1103, position: "center 55%", title: "Your flavor. Your formation.", short: "The freedom", alt: "A pastry chef carefully finishing a red cake", copy: "Mix the shop’s prepared flavors. Choose a Triangle wheel or a Stack, then decide on sections or layers, fillings, toppings, and decorations. Our concept turns choosing a cake into the joy of creating one." },
  { id: "next", image: "AboutUs4.webp", width: 735, height: 1103, position: "center 58%", title: "Room for more possibilities.", short: "The next chapter", alt: "A baker lifting a whisk from a stand mixer", copy: "Our vision is to make personalization a defining part of the cake experience. More flavors, physical and digital channels, and future partnerships give the concept room to grow—while keeping creativity, choice, and quality at its heart." },
];

export function BrandStory() {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const cake = useRef<HTMLDivElement>(null);
  const pose = useRef<StoryCakePose>({ separation: 0, chapter: 0 });
  const draw = useRef<(() => void) | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [loadScene, setLoadScene] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    if (!section.current || !pin.current || !track.current || !cake.current) return;
    const root = section.current;
    const visual: HTMLDivElement = pin.current;
    const timeline = track.current;
    const stage: HTMLDivElement = cake.current;

    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const stops = Array.from(timeline.querySelectorAll<HTMLElement>("article"));
    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    let frame = 0;
    let inRange = false;
    let initialized = false;
    let previousTime = 0;
    let focusChapter: number | null = null;

    function update(time: number) {
      frame = 0;
      const top = visual.getBoundingClientRect().top;
      const height = visual.offsetHeight;
      const bottom = top + height;
      const focus = window.innerWidth > 740
        ? top + height * .53
        : bottom + Math.min(145, Math.max(60, (window.innerHeight - bottom) * .38));
      const centers = stops.map(stop => {
        const box = stop.getBoundingClientRect();
        return box.top + box.height / 2;
      });
      const first = stops[0].getBoundingClientRect();
      const spread = clamp((focus - first.top + first.height * .21) / (first.height * .6));
      const separation = motion.matches ? 1 : spread * spread * (3 - 2 * spread);

      let chapter = 0;
      for (let index = 1; index < centers.length; index++) {
        chapter += clamp((focus - centers[index - 1]) / (centers[index] - centers[index - 1]));
      }

      if (motion.matches) chapter = Math.round(chapter);
      const selected = spread > .18 ? Math.round(chapter) : null;
      if (selected !== focusChapter) {
        focusChapter = selected;
        setActive(selected);
      }

      const current = pose.current;
      const elapsed = previousTime ? Math.min(time - previousTime, 40) : 16;
      const blend = motion.matches || !initialized ? 1 : 1 - Math.exp(-elapsed / 85);
      initialized = true;
      previousTime = time;
      const pending = Math.abs(current.separation - separation) + Math.abs(current.chapter - chapter) > .002;
      current.separation = pending ? current.separation + (separation - current.separation) * blend : separation;
      current.chapter = pending ? current.chapter + (chapter - current.chapter) * blend : chapter;
      stage.style.setProperty("--cake-spread", String(current.separation));
      draw.current?.();
      if (pending) schedule();
      else previousTime = 0;
    }

    function schedule() {
      if (inRange && !frame) frame = requestAnimationFrame(update);
    }

    const viewport = new IntersectionObserver(([entry]) => {
      inRange = entry.isIntersecting;
      if (inRange) {
        setLoadScene(true);
        schedule();
      } else {
        cancelAnimationFrame(frame);
        frame = 0;
        initialized = false;
        previousTime = 0;
      }
    }, { rootMargin: "230px 0px" });
    viewport.observe(root);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);

    return () => {
      viewport.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
    };
  }, []);

  return <section className="story-chapters" id="story" aria-labelledby="story-title" ref={section}>
    <div className="about-story-layout">
      <div className="about-story-visual" ref={pin}>
        <nav className="about-story-buttons" aria-label="About Us chapters">
          {chapters.map((chapter, index) => <a key={chapter.id} href={`#story-${chapter.id}`}
            aria-current={active === index ? "location" : undefined}
            style={{ "--chapter-color": flavors[storyCakeFlavors[index]].icing } as CSSProperties}>
            <span aria-hidden="true" />{chapter.short}
          </a>)}
        </nav>
        <div className="about-story-cake" ref={cake} data-live={sceneReady}>
          <div className="story-cake-fallback" aria-hidden="true">
            <Image src="/images/details/products/cutouts/layer-1.webp" width={343} height={310} alt="" sizes="(max-width: 740px) 230px, 400px" />
            <div className="story-cake-fallback-layers">
              {storyCakeFlavors.map((flavor, index) => <span key={flavor} data-active={active === index}
                style={{ "--sponge": flavors[flavor].sponge, "--frosting": flavors[flavor].icing } as CSSProperties} />)}
            </div>
          </div>
          {loadScene && <CakeScene pose={pose} draw={draw} onReady={setSceneReady} />}
        </div>
      </div>
      <div className="about-story-track" ref={track}>
        <header className="about-story-intro">
          <div>
            <span className="eyebrow">The idea behind ForméSlice</span>
            <h2 id="story-title">About Us</h2>
            <p>Good cake brings people together. We believe choosing it should leave room for a little more <strong>you.</strong></p>
            <a className="story-action" href="#story-beginning">Explore the layers <ArrowDown size={15} aria-hidden="true" /></a>
          </div>
        </header>
        {chapters.map((chapter, index) => <article className="about-story-chapter" key={chapter.id} id={`story-${chapter.id}`}
          aria-labelledby={`story-${chapter.id}-title`}
          style={{ "--chapter-color": flavors[storyCakeFlavors[index]].icing } as CSSProperties}>
          <div className="about-story-panel">
            <span className="eyebrow">{chapter.short}</span>
            <h3 id={`story-${chapter.id}-title`}>{chapter.title}</h3>
            <p>{chapter.copy}</p>
            <figure className="about-story-photo">
              <Image src={`/images/details/story/${chapter.image}`} width={chapter.width} height={chapter.height}
                alt={chapter.alt} style={{ objectPosition: chapter.position }} sizes="(max-width: 740px) 90vw, 420px" />
            </figure>
          </div>
        </article>)}
      </div>
    </div>
  </section>;
}
