"use client";

import { useVisibleAutoplay } from "./use-visible-autoplay";
import Image from "next/image";
import { useRef, useState } from "react";

const founders = [
  { name: "Lhaiza Mari Kim Ambos", photo: "lhaiza.webp" },
  { name: "Nestor Canlas", photo: "nestor.webp" },
  { name: "Kenneth Falla", photo: "kenneth.webp" },
  { name: "Joshua Madulid", photo: "joshua.webp" },
];

const positions = ["center", "right", "back", "left"];

export function Founders() {
  const [active, setActive] = useState(0);
  const hasSelected = useRef(false);
  const stage = useRef<HTMLDivElement>(null);
  useVisibleAutoplay(stage, () => {
    if (!hasSelected.current && !stage.current?.matches(":focus-within, :hover")) {
      setActive(index => (index + 1) % founders.length);
    }
  }, 4800);

  function selectFounder(index: number) {
    hasSelected.current = true;
    setActive(index);
  }

  return <section className="founders-section" id="founders" aria-labelledby="founders-title">
    <div className="content centered">
      <span className="eyebrow">THE PEOPLE BEHIND FORMÉSLICE</span>
      <h2 id="founders-title">Meet the founders.</h2>
      <p>Four perspectives. One shared idea.</p>
    </div>
    <div className="founder-carousel" aria-roledescription="carousel" aria-label="ForméSlice founders">
      <div className="founder-stage" ref={stage}>
        {founders.map((founder, index) => {
          const position = positions[(index - active + founders.length) % founders.length];
          return <div className="founder-slide" key={founder.photo} data-position={position}>
            <button className="founder-card" type="button" aria-pressed={index === active} onClick={() => selectFounder(index)}>
              <Image src={`/images/details/founders/${founder.photo}`} width={360} height={360} alt="" sizes="(max-width: 767px) 44vw, 285px" />
              <span className="founder-name"><strong>{founder.name}</strong><small>Co-founder</small></span>
            </button>
          </div>;
        })}
      </div>
      <div className="founder-dots" role="group" aria-label="Choose a founder">
        {founders.map((founder, index) => <button type="button" key={founder.photo} aria-label={founder.name}
          aria-pressed={index === active} onClick={() => selectFounder(index)} />)}
      </div>
    </div>
  </section>;
}
