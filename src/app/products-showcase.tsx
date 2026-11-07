"use client";

import Link from "next/link";
import { useVisibleAutoplay } from "./use-visible-autoplay";
import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowDown, CakeSlice, Cherry, Layers, Plus } from "lucide-react";


const formations = [
  {
    id: "triangle", label: "Triangle wheels", title: "Triangle formation",
    photos: ["Ube & Chocolate", "Matcha & Mango", "Chocolate Caramel", "Mango & Red Velvet", "Blueberry & Raspberry"].map((name, index) => ({ image: `triangle-${index + 1}`, name, width: 343, height: 345 })),
  },
  {
    id: "stack", label: "Layered stacks", title: "Stack formation",
    photos: ["Berry & Ube", "Mango & Strawberry", "Vanilla Caramel Crunch", "Blueberry & Honey", "Matcha & Cookie"].map((name, index) => ({ image: `layer-${index + 1}`, name, width: 343, height: 310 })),
  },
  {
    id: "tasters", label: "Solo & tasters", title: "Solo & taster sets",
    photos: [
      "Chocolate Solo",
      "Green Tea Solo",
      "Pink Velvet Solo",
      "Golden Layered Taster",
      "Berry Layered Taster",
      "Cocoa Layered Taster",
    ].map((name, index) => ({ image: `solo-${index + 1}`, name, width: 480, height: 480 })),
  },
];


function CakeCatalog() {
  const [selection, setSelection] = useState(0);
  const track = useRef<HTMLUListElement>(null);
  const item = formations[selection];
  useVisibleAutoplay(track, () => {
    const rail = track.current;
    const card = rail?.firstElementChild;
    if (!rail || !card) return;
    const end = rail.scrollWidth - rail.clientWidth;
    if (end < 2) return;
    const step = card.getBoundingClientRect().width + 14;
    rail.scrollTo({
      left: rail.scrollLeft >= end - 2 ? 0 : Math.min(end, (Math.round(rail.scrollLeft / step) + 1) * step),
      behavior: "smooth",
    });
  }, 4200);

  function selectFormation(index: number) {
    setSelection(index);
    track.current?.scrollTo({ left: 0, behavior: "instant" });
  }

  function scrollCatalog(direction: -1 | 1) {
    const rail = track.current;
    const card = rail?.firstElementChild;
    if (!rail || !card) return;
    const step = card.getBoundingClientRect().width + 14;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollBy({ left: direction * step, behavior: reducedMotion ? "instant" : "smooth" });
  }

  return <section className="reference-catalog" id="product-catalog" aria-labelledby="reference-catalog-title">
    <div className="catalog-formations">
      <span className="eyebrow">EXPLORE</span>
      <h4 id="reference-catalog-title">Choose your formation</h4>
      <div className="catalog-picker" role="group" aria-label="Cake formations">
        {formations.map((group, index) => <button type="button" key={group.id} onClick={() => selectFormation(index)}
          aria-controls="catalog-products" aria-pressed={index === selection}>
          <span><ProductPhoto photo={group.photos[0]} decorative /></span>
          {group.label}
        </button>)}
      </div>
    </div>
    <div className="catalog-products" id="catalog-products">
      <span className="eyebrow">SAMPLE PRODUCTS</span>
      <h4 aria-live="polite">{item.title}</h4>
      <div className="catalog-gallery">
        <ul className="catalog-track" ref={track} aria-label={item.title} tabIndex={0}
          onKeyDown={event => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            scrollCatalog(event.key === "ArrowLeft" ? -1 : 1);
          }}>
          {item.photos.map(photo => <li className="reference-card" key={photo.image}>
            <ProductPhoto photo={photo} decorative />
            <h5>{photo.name}</h5>
            <p>{item.label}</p>
          </li>)}
        </ul>
      </div>
      <div className="catalog-dots" role="group" aria-label="Switch formation">
        {formations.map((group, index) => <button type="button" key={group.id} aria-label={group.title} aria-pressed={index === selection} onClick={() => selectFormation(index)} />)}
      </div>
      <Link className="reference-cta catalog-studio-link" id="cake-builder" href="/cake-studio/">Try our 3D experience</Link>
    </div>
  </section>;
}

function ProductPhoto({ photo, decorative = false }: { photo: typeof formations[number]["photos"][number]; decorative?: boolean }) {
  return <Image src={`/images/details/products/cutouts/${photo.image}.webp`}
    width={photo.width} height={photo.height} alt={decorative ? "" : photo.name} draggable={false} />;
}

export function ProductsShowcase() {
  return <section className="products-reference" id="formations" aria-labelledby="sample-products-title">
    <div className="reference-panel">
      <div className="reference-lead">
        <div className="reference-local-nav">
          <span className="reference-wordmark">ForméSlice</span>
          <nav aria-label="Sample Products navigation">
            <a href="#product-collection">Collection</a>
            <a href="#product-feature">Make it yours</a>
            <a href="#product-catalog">Catalog</a>
            <Link href="/cake-studio/">Cake builder</Link>
          </nav>
          <a className="reference-catalog-icon" href="#product-catalog" aria-label="Jump to the cake catalog"><CakeSlice size={20} aria-hidden="true" /></a>
        </div>
        <h3 id="sample-products-title" className="reference-giant-type" aria-label="Your flavor. Your formation."><span>Your</span><span>Flavor. Your</span><span>Formation.</span></h3>
        <Image className="reference-hero-product" src="/images/details/products/box.webp" width={1186} height={1048} alt="Stacked ForméSlice cake boxes in cocoa brown and vanilla cream" sizes="(max-width: 700px) 64vw, 530px" />
      </div>

      <section className="reference-collection" id="product-collection" aria-labelledby="reference-collection-title">
        <div className="reference-side-stack" aria-hidden="true">
          {["triangle-2", "triangle-3", "triangle-5"].map(photo => <Image key={photo} src={`/images/details/products/cutouts/${photo}.webp`} width={343} height={345} alt="" sizes="180px" />)}
        </div>
        <div className="reference-collection-copy">
          <h4 id="reference-collection-title">The Cake Collection</h4>
          <div className="reference-equation" aria-label="Slices plus layers plus your finishing touch">
            <span><CakeSlice size={35} strokeWidth={1.25} aria-hidden="true" /><small>Slices</small></span>
            <Plus size={18} aria-hidden="true" />
            <span><Layers size={35} strokeWidth={1.25} aria-hidden="true" /><small>Layers</small></span>
            <Plus size={18} aria-hidden="true" />
            <span><Cherry size={35} strokeWidth={1.25} aria-hidden="true" /><small>Your touch</small></span>
          </div>
          <p>Mix prepared flavors in one cake. Choose a Triangle wheel, build a Stack, or pick a smaller set. Make it yours with the fillings, toppings, and finishes you love.</p>
          <a className="reference-cta" href="#product-catalog">View the catalog <ArrowDown size={15} aria-hidden="true" /></a>
        </div>
        <Image className="reference-side-box" src="/images/details/products/box2.webp" width={1326} height={1572} alt="" aria-hidden="true" sizes="300px" />
      </section>

      <section className="reference-feature" id="product-feature" aria-labelledby="reference-feature-title">
        <h4 id="reference-feature-title" className="sr-only">Make it yours</h4>
        <span className="reference-ghost reference-ghost-top" aria-hidden="true">Mix</span>
        <span className="reference-ghost reference-ghost-bottom" aria-hidden="true">Create</span>
        <div className="reference-feature-copy reference-feature-left">
          <div><h5>Mix your flavors</h5><p>Bring different shop-prepared flavors together in one cake.</p></div>
          <div><h5>Choose your formation</h5><p>Arrange slices in a Triangle wheel or make every layer of a Stack your own.</p></div>
        </div>
        <figure className="reference-feature-image"><ProductPhoto photo={formations[1].photos[1]} /></figure>
        <div className="reference-feature-copy reference-feature-right">
          <div><h5>Finish it your way</h5><p>Pick your fillings, toppings, and decorations to make it personal.</p></div>
          <div><h5>Share a little sweetness</h5><p>Choose a solo slice, a Trio Box, or a Quartet Box.</p></div>
        </div>
      </section>
      <CakeCatalog />
    </div>
  </section>;
}
