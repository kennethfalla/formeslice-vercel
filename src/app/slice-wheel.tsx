import Image from "next/image";
import type { CSSProperties } from "react";

const triangleFlavors = ["Ube and chocolate", "Matcha and mango", "Chocolate caramel", "Mango and red velvet", "Blueberry and raspberry"];

export function SliceWheel() {
  return <figure className="about-benefits-cake">
    <div className="slice-wheel-frame">
      <div className="slice-wheel" role="img" aria-label="Triangle cakes in ube and chocolate, matcha and mango, chocolate caramel, mango and red velvet, and blueberry and raspberry">
        {triangleFlavors.map((flavor, index) =>
          <Image key={flavor} src={`/images/details/products/cutouts/triangle-${index + 1}.webp`}
            width={343} height={345} alt="" draggable={false} style={{ "--slice-delay": `${index ? (index - 5) * 3.2 : 0}s` } as CSSProperties} />)}
      </div>
    </div>
  </figure>;
}
