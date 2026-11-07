import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";

export function Hero() {
  return (
    <section className="hero-flight" aria-labelledby="hero-title">
      <div className="brand-hero">
        <Image
          className="brand-hero-photo"
          src="/images/details/hero.webp"
          width={736}
          height={920}
          alt="A model biting into a pink-frosted slice of cake"
          preload
        />
        <div className="brand-hero-inner">
          <div className="brand-hero-copy">
            <span className="eyebrow">FORMÉSLICE · CUSTOMIZABLE CAKES</span>
            <h1 id="hero-title">Your Flavor.<br />Your Formation.</h1>
            <p>Mix your favorite flavors and build a cake that feels like you.</p>
          </div>
          <div className="brand-hero-actions">
            <a className="pill brand-hero-cta" href="#formations">Explore the cake menu <ArrowUpRight size={17} aria-hidden="true" /></a>
            <a className="hero-scroll-cue" href="#about"><ArrowDown size={15} aria-hidden="true" /> Scroll to discover</a>
          </div>
        </div>
      </div>
    </section>
  );
}
