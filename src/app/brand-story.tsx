"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { flavors, storyCakeFlavors } from "./cake-recipe";
import { getStoryLayers, type StoryCakePose } from "./story-cake-layout";

const CakeScene = dynamic(() => import("./story-cake-scene").then(module => module.StoryCakeScene), { ssr: false });

const chapters = [
  { id: "beginning", image: "AboutUs1.webp", width: 600, height: 600, position: "center 64%", title: "A sweeter beginning.", short: "The beginning", alt: "A baker in a pink apron decorating a cake", copy: "ForméSlice began with a simple gap: cake buyers often have to choose from fixed flavors and designs. We imagined a more personal experience—one where your preferences help shape the cake." },
  { id: "name", image: "AboutUs2.webp", width: 673, height: 1024, position: "center 58%", title: "A name made to create.", short: "The name", alt: "A baker mixing ingredients in a large bowl", copy: "“Form” means forming or creating. “Slice” is the cake itself. Together, ForméSlice expresses our “Create Your Own Slice” idea: a cake shaped by your taste, your choices, and your own arrangement." },
  { id: "freedom", image: "AboutUs3.webp", width: 735, height: 1103, position: "center 55%", title: "Your flavor. Your formation.", short: "The freedom", alt: "A pastry chef carefully finishing a red cake", copy: "Mix the shop’s prepared flavors. Choose a Triangle wheel or a Stack, then decide on sections or layers, fillings, toppings, and decorations. Our concept turns choosing a cake into the joy of creating one." },
  { id: "next", image: "AboutUs4.webp", width: 735, height: 1103, position: "center 58%", title: "Room for more possibilities.", short: "The next chapter", alt: "A baker lifting a whisk from a stand mixer", copy: "Our vision is to make personalization a defining part of the cake experience. More flavors, physical and digital channels, and future partnerships give the concept room to grow—while keeping creativity, choice, and quality at its heart." },
];

export function BrandStory() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const visual = useRef<HTMLDivElement>(null);
  const pose = useRef<StoryCakePose>({ separation: 0, chapter: 0 });
  const draw = useRef<(() => void) | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [loadScene, setLoadScene] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    if (!section.current || !track.current || !visual.current) return;
    const root = section.current;
    const stage = visual.current;
    const stops = Array.from(track.current.children);
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let inRange = false;
    let lastFrame = 0;
    let initialized = false;
    let selected: number | null = null;

    function update(time: number) {
      frame = 0;
      const pinTop = Number.parseFloat(getComputedStyle(stage).top);
      const first = stops[1].getBoundingClientRect();
      const step = first.height;
      const position = (pinTop - first.top) / step;
      const spread = Math.min(1, Math.max(0, 1 + position));
      const separation = motion.matches ? Number(spread >= .5) : spread * spread * (3 - 2 * spread);
      const chapter = Math.min(chapters.length - 1, Math.max(0, position));
      const next = spread >= .5 ? Math.round(chapter) : null;
      if (next !== selected) {
        selected = next;
        setActive(next);
      }

      const current = pose.current;
      const elapsed = lastFrame ? Math.min(time - lastFrame, 40) : 16;
      const blend = motion.matches || !initialized ? 1 : 1 - Math.exp(-elapsed / 72);
      const target = motion.matches ? Math.round(chapter) : chapter;
      const moving = Math.abs(current.separation - separation) + Math.abs(current.chapter - target) > .002;
      current.separation = moving ? current.separation + (separation - current.separation) * blend : separation;
      current.chapter = moving ? current.chapter + (target - current.chapter) * blend : target;
      initialized = true;
      lastFrame = moving ? time : 0;

      stage.style.setProperty("--cake-spread", String(current.separation));
      getStoryLayers(current.chapter).forEach(({ top, height, emphasis }, index) => {
        stage.style.setProperty(`--layer-top-${index}`, `${top * 100}%`);
        stage.style.setProperty(`--layer-height-${index}`, `${height * 100}%`);
        const reveal = Math.min(current.separation, emphasis);
        stage.style.setProperty(`--layer-reveal-${index}`, String(Math.max(0, (reveal - .76) / .24)));
      });
      draw.current?.();
      if (moving) schedule();
    }

    function schedule() {
      if (inRange && !frame) frame = requestAnimationFrame(update);
    }

    const observer = new IntersectionObserver(([entry]) => {
      inRange = entry.isIntersecting;
      if (inRange) {
        setLoadScene(true);
        schedule();
      } else {
        cancelAnimationFrame(frame);
        frame = 0;
        lastFrame = 0;
        initialized = false;
      }
    }, { rootMargin: "200px 0px" });
    observer.observe(root);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
    };
  }, []);

  return <section className="story-chapters" id="story" aria-labelledby="story-title" ref={section}>
    <div className="about-story-layout">
      <div className="about-story-track" ref={track} aria-hidden="true">
        <div />
        {chapters.map(chapter => <div key={chapter.id} id={`story-${chapter.id}`} />)}
      </div>
      <div className="about-story-visual" ref={visual} data-live={sceneReady}>
        <div className="about-story-stage">
          <div className="about-story-cake" aria-hidden="true">
            <div className="story-cake-fallback">
              <Image src="/images/details/products/cutouts/layer-1.webp" width={343} height={310} alt="" sizes="70vw" />
            </div>
            {loadScene && <CakeScene pose={pose} draw={draw} onReady={setSceneReady} />}
          </div>
          <header className="about-story-intro" data-visible={active === null}>
            <span className="eyebrow">The idea behind ForméSlice</span>
            <h2 id="story-title">About Us</h2>
            <p>Good cake brings people together. We believe choosing it should leave room for a little more <strong>you.</strong></p>
          </header>
          {chapters.map((chapter, index) => {
            const flavor = flavors[storyCakeFlavors[index]];
            return <article className="about-story-layer" key={chapter.id} data-active={active === index}
              aria-labelledby={`story-${chapter.id}-title`}
              style={{
                "--layer-top": `var(--layer-top-${index}, 0%)`,
                "--layer-height": `var(--layer-height-${index}, 0%)`,
                "--layer-reveal": `var(--layer-reveal-${index}, 0)`,
                "--layer-color": flavor.sponge,
                "--layer-icing": flavor.icing,
              } as CSSProperties}>
              <span className="about-layer-label" aria-hidden="true">{chapter.short}</span>
              <div className="about-layer-content">
                <div>
                  <span className="eyebrow">{chapter.short}</span>
                  <h3 id={`story-${chapter.id}-title`}>{chapter.title}</h3>
                  <p>{chapter.copy}</p>
                </div>
                <figure className="about-story-photo">
                  <Image src={`/images/details/story/${chapter.image}`} width={chapter.width} height={chapter.height}
                    alt={chapter.alt} style={{ objectPosition: chapter.position }} sizes="200px" />
                </figure>
              </div>
            </article>;
          })}
        </div>
        <nav className="about-story-buttons" aria-label="About Us chapters">
          {chapters.map((chapter, index) => <a key={chapter.id} href={`#story-${chapter.id}`}
            aria-current={active === index ? "location" : undefined}
            style={{ "--chapter-color": flavors[storyCakeFlavors[index]].icing } as CSSProperties}>
            <span aria-hidden="true" />{chapter.short}
          </a>)}
        </nav>
      </div>
    </div>
  </section>;
}
