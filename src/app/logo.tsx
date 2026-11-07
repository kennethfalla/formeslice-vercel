import Image from "next/image";

export function Logo({ symbol = false, className = "" }: { symbol?: boolean; className?: string }) {
  return <Image className={`brand-image ${className}`} src={`/images/details/${symbol ? "Secondarylogo.png" : "Primarylogo.png"}`} width={symbol ? 514 : 1400} height={symbol ? 918 : 940} alt={symbol ? "ForméSlice secondary logo" : "ForméSlice"} sizes={symbol ? "150px" : "(max-width: 767px) 170px, 220px"} />;
}
