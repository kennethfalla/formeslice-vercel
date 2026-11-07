import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SliceWheel } from "./slice-wheel";
import { SyrupEdge } from "./syrup-edge";

const choices = [
  { title: "Choose a formation", copy: "Start with a Triangle wheel of slices or a Stack with the number of layers you want." },
  { title: "Mix your flavors", copy: "Combine your favorite prepared flavors, then pair them with fillings and toppings." },
  { title: "Make it yours", copy: "Finish it with your choice of decorations. Share a whole cake or try a solo slice, Trio Box, or Quartet Box." },
];

export function MissionVision() {
  return <>
    <section className="about-purpose" id="mission-vision" aria-labelledby="values-title">
      <SyrupEdge className="section-syrup section-syrup-top" />
      <div className="about-purpose-copy">
        <span className="eyebrow">What guides us</span>
        <h2 id="values-title">Our Mission &amp; Vision</h2>
        <h3>Mission</h3>
        <p>We make quality, customizable cakes and give you the freedom to mix prepared flavors and choose your formation, layers, fillings, and toppings. We bring consistent products, service, and care to each creation.</p>
        <h3>Vision</h3>
        <p>We aim to become a recognized, innovative cake brand where personalization defines the experience. We plan to expand flavors and products, reach more people in person and online, and build partnerships for sustainable growth.</p>
        <a className="bakery-button" href="#formations">Explore the cake menu <ArrowUpRight size={16} aria-hidden="true" /></a>
      </div>
      <figure className="about-purpose-photo"><Image src="/images/details/story/AboutUs5.webp" width={736} height={980} alt="A pastry chef finishing a cake" sizes="(max-width: 767px) 100vw, 52vw" /></figure>
    </section>
    <section className="about-benefits" id="create-your-own-slice" aria-labelledby="about-benefits-title">
      <div className="about-benefits-heading">
        <span className="eyebrow">CREATE YOUR OWN SLICE</span>
        <h2 id="about-benefits-title">Make it yours, by the slice</h2>
        <p>What to expect when you put your own cake together.</p>
      </div>
      <div className="about-benefits-grid">
        <SliceWheel />
        <div className="about-benefit-list">
          {choices.map((choice, index) => <article className="about-benefit-card" key={choice.title}>
            <span className="eyebrow">0{index + 1}</span>
            <h3>{choice.title}</h3>
            <p>{choice.copy}</p>
          </article>)}
        </div>
      </div>
      <Link className="story-action" href="/cake-studio/">Build your own cake</Link>
    </section>
  </>;
}
