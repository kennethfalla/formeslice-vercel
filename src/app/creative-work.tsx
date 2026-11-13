"use client";

import Image from "next/image";
import { SyrupEdge } from "./syrup-edge";

const supportingPosts = [
  { src: "febpics/feb1.jpg", title: "A flavor-filled invitation", archive: 5, size: 2048, alt: "Cake slices and stacked layers with the ForméSlice tagline and a 25 percent offer" },
  { src: "febpics/feb2.png", title: "Chocolate meets berries", archive: 6, size: 1080, alt: "Chocolate Berries artwork with berry-topped cake slices and a 50 percent offer" },
  { src: "febpics/feb3.jpg", title: "One brand, many possibilities", archive: 7, size: 1080, alt: "Cream ForméSlice artwork with cake slices, a layered cake, and the brand tagline" },
];

export function LaunchPost({ open }: { open: (index: number) => void }) {
  return <section className="launch-showcase" id="creative" aria-labelledby="launch-title">
    <div className="showcase-stage">
      <SyrupEdge className="section-syrup section-syrup-top showcase-syrup" />
      <SyrupEdge className="section-syrup section-syrup-bottom" />
      <div className="launch-inner">
        <h2 id="launch-title">First ever brand post</h2>
        <article className="launch-feature">
          <button className="launch-art" type="button" onClick={() => open(3)} aria-label="Enlarge the first official brand post">
            <Image src="/images/details/Firsteverbrandpost.png" width={1080} height={1080}
              alt="The first ForméSlice brand post showing a wheel of assorted cakes with the brand tagline"
              sizes="(max-width: 700px) 92vw, (max-width: 1140px) 49vw, 545px" />
          </button>
          <div className="launch-caption">
            <span className="eyebrow">Official brand post</span>
            <h3>Introducing FORMÉSLICE.</h3>
            <p>A different way to experience cake.</p>
            <p>Choose your flavors. Build your layers. Add the details you love. Then bring everything together in a form of your own.</p>
            <p>Designed around the idea of Create Your Own Slice, FORMÉSLICE turns every cake into a personal composition — made to your taste, shaped by your choices.</p>
            <p>Your flavor. Your formation.</p>
            <p>This is FORMÉSLICE.</p>
          </div>
        </article>
        <section className="launch-support" aria-labelledby="launch-support-title">
          <h3 id="launch-support-title">Supporting posts</h3>
          <ul>
            {supportingPosts.map(item => <li key={item.src}>
              <button className="launch-art" type="button" onClick={() => open(item.archive)} aria-label={`Enlarge ${item.title}`}>
                <Image src={`/images/details/${item.src}`} width={item.size} height={item.size} alt={item.alt}
                  sizes="(max-width: 700px) 29vw, (max-width: 1140px) 30vw, 355px" />
              </button>
            </li>)}
          </ul>
        </section>
      </div>
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
