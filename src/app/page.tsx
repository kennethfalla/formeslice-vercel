"use client";

import Image from "next/image";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { ArrowUpRight, Menu, Palette, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BusinessConcept } from "./business-concept";
import { BrandStory } from "./brand-story";
import { Identity } from "./identity";
import { Founders } from "./founders";
import { Hero } from "./hero";
import { Campaign, LaunchPost } from "./creative-work";
import { PageEffects } from "./page-effects";
import { SyrupEdge } from "./syrup-edge";
import { MissionVision } from "./mission-vision";
import { Logo } from "./logo";
import { useVisibleAutoplay } from "./use-visible-autoplay";

const archive = [
  { src: "Sketch.jpg", title: "The original sketch", description: "The original hand-drawn ForméSlice identity study.", width: 1791, height: 1860 },
  { src: "Primarylogo.png", title: "The primary logo", description: "The updated ForméSlice primary wordmark, with rounded pink and cream lettering.", width: 1400, height: 940 },
  { src: "Secondarylogo.png", title: "The secondary logo", description: "The updated ForméSlice secondary symbol: a cherry-topped F and cake-shaped S.", width: 514, height: 918 },
  { src: "Firsteverbrandpost.png", title: "Our first official brand post", description: "Your Flavor. Your Formation. The first ForméSlice social media artwork.", width: 1080, height: 1080 },
  { src: "Promotional.png", title: "The Sunrise Collection", description: "The supplied student promotional campaign concept inspired by The Hunger Games: Sunrise on the Reaping.", width: 1080, height: 1350 },
  { src: "febpics/feb1.jpg", title: "A flavor-filled invitation", description: "Supporting ForméSlice artwork with cake slices, layers, the brand tagline, and a promotional offer.", width: 2048, height: 2048 },
  { src: "febpics/feb2.png", title: "Chocolate meets berries", description: "The supplied Chocolate Berries promotional artwork.", width: 1080, height: 1080 },
  { src: "febpics/feb3.jpg", title: "One brand, many possibilities", description: "Supporting brand artwork showing an assortment of cake slices and a layered cake.", width: 1080, height: 1080 },
];
const links = [{ id: "about", label: "About Us" }, { id: "formations", label: "Cake menu" }, { id: "identity", label: "Our identity" }, { id: "creative", label: "Creative work" }];

function Pill({ children, href }: { children: React.ReactNode; href: string }) {
  return <a className="pill" href={href}>{children}<ArrowUpRight size={16} aria-hidden="true" /></a>;
}
function Gallery({ index, setIndex, close }: { index: number; setIndex: (index: number) => void; close: () => void }) {
  const dialog = useRef<HTMLDivElement>(null);
  const dismiss = useRef<HTMLButtonElement>(null);
  useVisibleAutoplay(dialog, () => setIndex((index + 1) % archive.length), 9000);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dismiss.current?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus({ preventScroll: true }); };
  }, []);
  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") setIndex((index + 1) % archive.length);
      if (event.key === "ArrowLeft") setIndex((index + archive.length - 1) % archive.length);
      if (event.key === "Tab") {
        const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>("button");
        if (!buttons?.length) return;
        const first = buttons[0]; const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [index, close, setIndex]);
  return <motion.div className="gallery-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}><div className="gallery" role="dialog" aria-modal="true" aria-labelledby="gallery-title" aria-describedby="gallery-caption" ref={dialog} onClick={event => event.stopPropagation()}><div className="gallery-top"><div><span className="eyebrow">THE FORMÉSLICE ARCHIVE · {index + 1}/{archive.length}</span><h2 id="gallery-title">{archive[index].title}</h2></div><button ref={dismiss} className="icon-button" onClick={close} aria-label="Close artwork"><X /></button></div><div className="gallery-image"><Image src={`/images/details/${archive[index].src}`} width={archive[index].width} height={archive[index].height} alt={archive[index].description} /></div><div className="gallery-bottom"><p id="gallery-caption">{archive[index].description}</p><div className="gallery-dots" role="group" aria-label="Choose artwork">{archive.map((item, position) => <button type="button" key={item.src} aria-label={item.title} aria-pressed={position === index} onClick={() => setIndex(position)} />)}</div></div></div></motion.div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [artwork, setArtwork] = useState<number | null>(null);
  const closeArtwork = useCallback(() => setArtwork(null), []);
  useEffect(() => { const closeMenu = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); }; document.addEventListener("keydown", closeMenu); return () => document.removeEventListener("keydown", closeMenu); }, []);
  return <MotionConfig reducedMotion="user">
    <PageEffects />
    <span className="home-anchor" id="home" aria-hidden="true" />
    <a href="#main" className="skip-link">Skip to content</a>
    <div className="nav-rail home-nav">
    <header className="header"><SyrupEdge className="nav-syrup" glossy /><div className="navigation"><a className="nav-logo" href="#home" aria-label="ForméSlice home"><Logo /></a><nav className="desktop-navigation" aria-label="Main navigation">{links.map(link => <a key={link.id} href={`#${link.id}`}>{link.label}</a>)}</nav><div className="nav-tools"><button className="menu-toggle" aria-controls="mobile-menu" aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div></div>{menuOpen && <nav className="mobile-menu" id="mobile-menu" aria-label="Mobile navigation">{links.map(link => <a href={`#${link.id}`} key={link.id} onClick={() => setMenuOpen(false)}>{link.label}<ArrowUpRight size={17} /></a>)}</nav>}<div className="navigation-progress" aria-hidden="true" /></header>
    </div>
    <main id="main" className="portfolio-main" tabIndex={-1}>
      <Hero />
      <section className="about-section cream-curve" id="about" aria-labelledby="story-title">
      <BrandStory />
      <MissionVision />
      <Founders />
      <BusinessConcept />
      </section>

      <Identity open={setArtwork} />
      <LaunchPost open={setArtwork} />
      <Campaign open={setArtwork} />
      <section className="closing pink-sky" aria-labelledby="closing-title"><SyrupEdge className="section-syrup section-syrup-top" /><SyrupEdge className="section-syrup section-syrup-bottom closing-syrup" /><Logo symbol className="closing-symbol" /><h2 id="closing-title">Find your flavor.<br />Make your formation.</h2><p>From the first idea to the final cherry on top.</p><Pill href="#home">Back to the first slice</Pill><div className="credits"><span className="eyebrow">THE PEOPLE BEHIND FORMÉSLICE</span><p>Lhaiza Mari Kim Ambos · Nestor Canlas<br />Kenneth Falla · Joshua Madulid</p><small>BSIT–4F · Creative Task #4 · Brand Presentation</small></div></section>
    </main>
    <footer><div className="footer-links"><a href="#about">About Us</a><a href="#identity">Our identity</a><a href="/images/details/business-concept.pdf" target="_blank" rel="noopener noreferrer">Business concept PDF <ArrowUpRight size={13} /><span className="sr-only"> (opens in a new tab)</span></a></div><span>© {new Date().getFullYear()} ForméSlice · A student brand portfolio</span><div className="footer-icons"><button className="replay-intro" onClick={() => window.dispatchEvent(new Event("formeslice:replay-intro"))}><RotateCcw size={14} aria-hidden="true" />Replay intro</button><a href="#identity" aria-label="Explore the brand palette"><Palette size={19} /></a><a href="#home" aria-label="Back to top"><ArrowUpRight size={20} /></a></div></footer>
    <AnimatePresence>{artwork !== null && <Gallery index={artwork} setIndex={setArtwork} close={closeArtwork} />}</AnimatePresence>
  </MotionConfig>;
}
