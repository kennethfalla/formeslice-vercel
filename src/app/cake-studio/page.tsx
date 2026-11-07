import type { Metadata } from "next";
import Link from "next/link";
import { CakeBuilder } from "../cake-builder";
import { Logo } from "../logo";
import { SyrupEdge } from "../syrup-edge";

export const metadata: Metadata = {
  title: "3D Cake Studio | ForméSlice",
  description: "Choose a formation and mix your favorite flavors in the ForméSlice 3D Cake Studio.",
};

export default function CakeStudioPage() {
  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <div className="nav-rail">
      <header className="header">
        <SyrupEdge className="nav-syrup" glossy />
        <div className="navigation">
          <Link className="nav-logo" href="/" aria-label="ForméSlice home"><Logo /></Link>
          <Link className="studio-return" href="/#product-catalog">Back to the cake menu</Link>
        </div>
      </header>
    </div>
    <main id="main" tabIndex={-1}><CakeBuilder /></main>
  </>;
}
