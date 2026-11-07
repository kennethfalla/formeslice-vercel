"use client";

import Image from "next/image";
import { useVisibleAutoplay } from "./use-visible-autoplay";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SyrupEdge } from "./syrup-edge";

const posts = [
  { src: "Firsteverbrandpost.png", title: "The first introduction", label: "FIRST OFFICIAL BRAND POST", archive: 3, width: 1080, height: 1080, alt: "The first ForméSlice brand post showing a wheel of assorted cake slices with the brand tagline", detail: "A cake wheel anchors the composition, while small Triangle and Stack examples introduce the two signature formations. The pink background, repeated wordmark, and curved tagline bring the identity into one introduction." },
  { src: "febpics/feb1.jpg", title: "A flavor-filled invitation", label: "SUPPORTING BRAND ARTWORK", archive: 5, width: 2048, height: 2048, alt: "ForméSlice artwork combining individual cake slices, stacked cake layers, the brand tagline, and a 25 percent promotional offer", detail: "Close-up layers and individual slices place flavor variety in the foreground. Large white lettering gives the tagline a strong reading order, with a promotional offer and contact details contained in the supplied artwork." },
  { src: "febpics/feb2.png", title: "Chocolate meets berries", label: "SUPPORTING BRAND ARTWORK", archive: 6, width: 1080, height: 1080, alt: "Chocolate Berries artwork featuring berry-topped cake slices, pink typography, and a 50 percent offer", detail: "Chocolate brown, berry pink, and bright fruit surround the featured cake slices. Oversized “Berries” lettering and a pink offer panel give this product-led post a clear focal point." },
  { src: "febpics/feb3.jpg", title: "One brand, many possibilities", label: "SUPPORTING BRAND ARTWORK", archive: 7, width: 1080, height: 1080, alt: "Cream ForméSlice brand artwork with several cake slices, a layered cake, the logo, and the brand tagline", detail: "A cream background gives the logo and cake assortment room to stand out. Triangle slices and a layered cake echo the customization concept, while the repeated tagline keeps the brand message consistent." },
];

export function LaunchPost() {
  const [active, setActive] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const post = posts[active];
  const move = (direction: number) => setActive(index => (index + direction + posts.length) % posts.length);

  useVisibleAutoplay(stage, () => setActive(index => (index + 1) % posts.length));
  useEffect(() => {
    const rail = track.current;
    const card = rail?.children[active] as HTMLElement | undefined;
    if (!rail || !card) return;
    const centerCard = (behavior: ScrollBehavior) => rail.scrollTo({
      left: card.offsetLeft + card.offsetWidth / 2 - rail.clientWidth / 2,
      behavior,
    });
    centerCard(reducedMotion ? "instant" : "smooth");
    // Keep the selected artwork centered when the device changes orientation.
    let width = rail.clientWidth;
    const resize = new ResizeObserver(() => {
      if (rail.clientWidth === width) return;
      width = rail.clientWidth;
      centerCard("instant");
    });
    resize.observe(rail);
    return () => resize.disconnect();
  }, [active, reducedMotion]);

  return <section className="launch-showcase" id="creative" aria-labelledby="launch-title">
    <h2 className="sr-only" id="launch-title">First ever brand post · Hello, sweet world.</h2>
    <div className={`showcase-stage showcase-theme-${active}`} ref={stage} role="region" aria-roledescription="carousel" aria-label="First brand post and supporting artwork" tabIndex={0} onKeyDown={event => { if (event.key === "ArrowRight") { event.preventDefault(); move(1); } if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); } }}>
      <SyrupEdge className="section-syrup section-syrup-top showcase-syrup" />
      <SyrupEdge className="section-syrup section-syrup-bottom" />
      <div className="showcase-backgrounds" aria-hidden="true">{posts.map((item, index) => <Image key={item.src} className={index === active ? "is-active" : ""} src={`/images/details/${item.src}`} width={item.width} height={item.height} alt="" sizes="100vw" />)}</div><div className="showcase-shade" />
      <div className="showcase-content"><span className="eyebrow">CT #2 · FORMÉSLICE / {post.label}</span><h3>{post.title}</h3><p>{post.detail}</p></div>
      <div className="showcase-card-area"><span className="eyebrow">EXPLORE THE BRAND POSTS</span><div className="showcase-track" ref={track}>{posts.map((item, index) => <button className={`showcase-card ${index === active ? "is-active" : ""}`} key={item.src} onClick={() => setActive(index)} aria-label={`Show ${item.title}`} aria-current={index === active ? "true" : undefined}><Image src={`/images/details/${item.src}`} width={item.width} height={item.height} alt={item.alt} sizes="(max-width: 767px) 160px, 210px" /><span><small>0{index + 1} / {index === 0 ? "THE FIRST POST" : "BRAND ARTWORK"}</small><strong>{item.title}</strong></span></button>)}</div></div>
    </div>

  </section>;
}

const campaignColors = [
  { name: "Harvest red", hex: "#D9363E" },
  { name: "Berry plum", hex: "#82515E" },
  { name: "Landscape green", hex: "#6B7F43" },
  { name: "Sunrise yellow", hex: "#FFE38E" },
];

export function Campaign({ open }: { open: (index: number) => void }) {
  return <section className="campaign-journal" id="campaign" aria-labelledby="campaign-title">
    <article className="campaign-article">
      <header className="campaign-article-header">
        <span className="eyebrow">CREATIVE TASK 3</span>
        <h2 id="campaign-title">Promotional poster</h2>
      </header>
      <div className="campaign-editorial-grid">
        <figure className="campaign-editorial-figure">
          <button onClick={() => open(4)} aria-label="Enlarge the Sunrise Collection promotional poster">
            <Image src="/images/details/Promotional.png" width={1080} height={1350} alt="The Sunrise Collection promotional poster with three layered cakes in a sunrise landscape" sizes="(max-width: 767px) 90vw, 550px" />
          </button>
        </figure>
        <div className="campaign-notes">
          <section className="campaign-prose" aria-labelledby="campaign-meaning-title">
            <h3 id="campaign-meaning-title">Behind the poster</h3>
            <p>Inspired by <em>The Hunger Games: Sunrise on the Reaping</em>, the sunrise and landscape give the collection a shared setting. The three cakes echo the land’s layers and colors. Sunrise sits largest in the foreground to lead the eye through the collection.</p>
          </section>
          <section className="campaign-palette" aria-labelledby="campaign-palette-title">
            <h3 id="campaign-palette-title">Color palette</h3>
            <p>The tetradic palette pairs harvest red and berry plum with landscape green and sunrise yellow.</p>
            <div className="campaign-color-circles">{campaignColors.map(color => <div key={color.hex}>
              <span className="campaign-color-circle" style={{ backgroundColor: color.hex }} aria-hidden="true" />
              <h4>{color.name}</h4>
              <p>{color.hex}</p>
            </div>)}</div>
          </section>
          <section className="campaign-type-story" aria-labelledby="campaign-type-title">
            <h3 id="campaign-type-title">Typography</h3>
            <p className="campaign-font-name">Bank Gothic Medium</p>
            <p>The wide, angular letters give the collection title a cinematic feel and set it apart from the supporting copy.</p>
          </section>
        </div>
      </div>
    </article>
  </section>;
}
