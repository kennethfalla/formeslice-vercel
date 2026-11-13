import Image from "next/image";
import { Expand } from "lucide-react";
import { Typography } from "./typography";
import { SyrupEdge } from "./syrup-edge";

const marks = [
  { src: "Primarylogo.png", width: 1400, height: 940, title: "Primary logo", subtitle: "The full ForméSlice signature", index: 1 },
  { src: "Secondarylogo.png", width: 514, height: 918, title: "Secondary logo", subtitle: "A smaller, sweeter brand mark", index: 2 },
  { src: "Sketch.jpg", width: 2085, height: 1792, title: "Original sketch", subtitle: "Where the identity began", index: 0 },
];
const palette = [
  { name: "Strawberry pink", hex: "#E5B3C1", rgb: "229 · 179 · 193", role: "Warmth & playful personality", className: "pink" },
  { name: "Vanilla cream", hex: "#F7EFDE", rgb: "247 · 239 · 222", role: "Space, softness & balance", className: "cream" },
  { name: "Cocoa brown", hex: "#654136", rgb: "101 · 65 · 54", role: "Grounding & readable contrast", className: "brown" },
];


export function Identity({ open }: { open: (index: number) => void }) {
  return <section className="identity-guide" id="identity" aria-labelledby="identity-title">
    <SyrupEdge className="section-syrup section-syrup-top identity-syrup" />
    <div className="identity-board">
    <div className="identity-board-heading"><span className="eyebrow">THE FORMÉSLICE IDENTITY · CT #1</span><h2 id="identity-title">Our brand.<br /><span>By the slice.</span></h2><p>A little guide to the marks, colors, and character<br />that make ForméSlice feel like ForméSlice.</p></div>

    <div className="identity-mark-grid">{marks.map(mark => <article className="identity-mark-card" key={mark.src}><button onClick={() => open(mark.index)} aria-label={`Enlarge ${mark.title}`}><Image src={`/images/details/${mark.src}`} width={mark.width} height={mark.height} alt={`ForméSlice ${mark.title.toLowerCase()}`} sizes="(max-width: 767px) 85vw, 360px" /><span className="mark-expand"><Expand size={15} aria-hidden="true" /></span></button><h3>{mark.title}</h3><p>{mark.subtitle}</p></article>)}</div>

    <div className="identity-name-band"><span className="eyebrow">A NAME WITH<br />CREATIVE FREEDOM</span><p><strong>“Form”</strong> means forming or creating. <strong>“Slice”</strong> is the cake itself. Together, they express the “Create Your Own Slice” concept.</p><p>The rounded lettering, cake-inspired shapes, and cherry-topped symbol give the supplied identity a playful, dessert-led character.</p></div>

    <div className="identity-guide-row"><div className="identity-row-label"><span className="eyebrow">COLOR PALETTE</span><h3>Our sweet spot.</h3><p>Strawberry, vanilla, and cocoa set the tone for this website: warm, expressive, and easy to read.</p></div><div className="identity-colors">{palette.map(color => <article className={`identity-color identity-color-${color.className}`} key={color.hex}><span className="color-star" aria-hidden="true">✳</span><h4>{color.name}</h4><p>{color.role}</p><div><strong>{color.hex}</strong><small>RGB {color.rgb}</small></div></article>)}</div></div>




    <Typography />


  </div></section>;
}
