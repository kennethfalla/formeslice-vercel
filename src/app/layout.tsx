import type { Metadata } from "next";
import { Lilita_One, Nunito, Science_Gothic } from "next/font/google";
import "./globals.css";
import "./section-backgrounds.css";
import "./products-showcase.css";
import "./clean-bakery.css";
import "./cocoa-bakery.css";
import "./brand-intro.css";
import "./hero.css";
import "./about-editorial.css";
import "./launch-post.css";
import "./cake-builder.css";
import "./portfolio-motion.css";
import { BrandIntro } from "./brand-intro";

const display = Lilita_One({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });
const body = Nunito({ subsets: ["latin"], variable: "--font-body", display: "swap" });

const posterFallback = Science_Gothic({ subsets: ["latin"], weight: "500", variable: "--font-poster-fallback", display: "swap", preload: false, adjustFontFallback: false });

export const metadata: Metadata = {
  metadataBase: new URL("https://formeslice-brand-portfolio.berrydawn1.chatgpt.site"),
  title: "ForméSlice — Your Flavor. Your Formation.",
  description: "A little flavor. A lot of you. Explore the ForméSlice brand story, playful visual identity, and creative campaigns.",
  openGraph: {
    title: "ForméSlice — Your Flavor. Your Formation.",
    description: "A brand built around the joy of creating your own slice.",
    images: [{ url: "/images/details/Firsteverbrandpost.png", width: 1080, height: 1080 }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const introGate = `(()=>{try{if(matchMedia('(prefers-reduced-motion: reduce)').matches||sessionStorage.getItem('formeslice-intro-v2'))return;sessionStorage.setItem('formeslice-intro-v2','seen');const root=document.documentElement;root.dataset.intro='first';setTimeout(()=>{if(root.dataset.intro!=='first')return;delete root.dataset.intro;const site=document.querySelector('.site-shell');if(site)site.inert=false;dispatchEvent(new Event('formeslice:intro-end'))},5800)}catch{}})()`;
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: introGate }} /></head><body className={`${display.variable} ${body.variable} ${posterFallback.variable}`}><BrandIntro /><div className="site-shell">{children}</div></body></html>;
}
