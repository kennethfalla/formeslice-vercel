"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useVisibleAutoplay } from "./use-visible-autoplay";

const chapters = [
  { image: "AboutUs1.webp", width: 600, height: 600, position: "center 64%", title: "A sweeter beginning.", short: "The beginning", alt: "A baker in a pink apron decorating a cake", copy: "ForméSlice began with a simple gap: cake buyers often have to choose from fixed flavors and designs. We imagined a more personal experience—one where your preferences help shape the cake." },
  { image: "AboutUs2.webp", width: 673, height: 1024, position: "center 58%", title: "A name made to create.", short: "The name", alt: "A baker mixing ingredients in a large bowl", copy: "“Form” means forming or creating. “Slice” is the cake itself. Together, ForméSlice expresses our “Create Your Own Slice” idea: a cake shaped by your taste, your choices, and your own arrangement." },
  { image: "AboutUs3.webp", width: 735, height: 1103, position: "center 55%", title: "Your flavor. Your formation.", short: "The freedom", alt: "A pastry chef carefully finishing a red cake", copy: "Mix the shop’s prepared flavors. Choose a Triangle wheel or a Stack, then decide on sections or layers, fillings, toppings, and decorations. Our concept turns choosing a cake into the joy of creating one." },
  { image: "AboutUs4.webp", width: 735, height: 1103, position: "center 58%", title: "Room for more possibilities.", short: "The next chapter", alt: "A baker lifting a whisk from a stand mixer", copy: "Our vision is to make personalization a defining part of the cake experience. More flavors, physical and digital channels, and future partnerships give the concept room to grow—while keeping creativity, choice, and quality at its heart." },
];

export function BrandStory() {
  const [active, setActive] = useState(0);
  const chapter = chapters[active];
  const gallery = useRef<HTMLDivElement>(null);
  useVisibleAutoplay(gallery, () => setActive(index => (index + 1) % chapters.length), 6500);
  return <section className="story-chapters" id="story" aria-labelledby="story-title">
    <div className="about-banner">
      <div className="about-banner-copy">
        <span className="eyebrow">The idea behind ForméSlice</span>
        <h2 id="story-title">About Us</h2>
        <p>Good cake brings people together. We believe choosing it should leave room for a little more <strong>you.</strong></p>
      </div>
    </div>
    <div className="about-story-spread" ref={gallery}>
      <figure className="about-story-photo">
        <Image key={chapter.image} src={`/images/details/story/${chapter.image}`} width={chapter.width} height={chapter.height} alt={chapter.alt} style={{ objectPosition: chapter.position }} sizes="(max-width: 767px) 91vw, 550px" />
      </figure>
      <div className="about-story-panel">
        <span className="eyebrow">Our story · 0{active + 1} / 04</span>
        <div className="about-chapter-copy" id="story-selected-copy">
          <h3>{chapter.title}</h3>
          <p>{chapter.copy}</p>
        </div>
        <div className="about-story-controls">
          <div className="about-story-thumbs" role="group" aria-label="Story chapters">
            {chapters.map((item, index) => <button key={item.image} type="button" onClick={() => setActive(index)} aria-pressed={index === active} aria-controls="story-selected-copy" aria-label={`${item.short}: ${item.title}`}>
              <Image src={`/images/details/story/${item.image}`} width={item.width} height={item.height} alt="" sizes="46px" />
            </button>)}
          </div>
        </div>
      </div>
    </div>
  </section>;
}
