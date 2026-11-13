import { cakeFormationLabel, flavors, type CakeRecipe } from "./cake-recipe";

export async function createCakeReceipt(recipe: CakeRecipe, preview: HTMLCanvasElement | null) {
  const width = 900;
  const height = 916 + recipe.flavors.length * 45;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create the receipt image");
  const ctx = context;

  const ink = "#552d27";
  const cream = "#fff3dd";
  const date = new Date();
  ctx.fillStyle = "#ecd0d4";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = cream;
  ctx.fillRect(58, 42, 784, height - 84);
  ctx.fillStyle = "#ecd0d4";
  for (let index = 0; index < 16; index++) {
    const x = 75 + index * 50;
    for (const y of [42, height - 42]) {
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function write(label: string, x: number, y: number, font: string, align: CanvasTextAlign = "left") {
    ctx.fillStyle = ink;
    ctx.font = font;
    ctx.textAlign = align;
    ctx.fillText(label, x, y);
  }

  function perforation(y: number) {
    ctx.strokeStyle = "#b5897d";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(116, y);
    ctx.lineTo(784, y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  write("FORMÉSLICE", 450, 137, "bold 62px Georgia", "center");
  write("CAKE DESIGN RECEIPT", 450, 180, "bold 22px monospace", "center");
  write(date.toLocaleDateString(undefined, { dateStyle: "long" }), 450, 218, "22px monospace", "center");
  perforation(246);

  if (preview) {
    const scale = Math.min(700 / preview.width, 360 / preview.height);
    const imageWidth = preview.width * scale;
    const imageHeight = preview.height * scale;
    ctx.drawImage(preview, (width - imageWidth) / 2, 256 + (360 - imageHeight) / 2, imageWidth, imageHeight);
  } else if (recipe.formation === "triangle") {
    const angle = Math.PI * 2 / recipe.flavors.length;
    recipe.flavors.forEach((selection, index) => {
      ctx.fillStyle = flavors[selection ?? 4].icing;
      ctx.strokeStyle = cream;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(450, 436);
      ctx.arc(450, 436, 140, index * angle - Math.PI / 2, (index + 1) * angle - Math.PI / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  } else {
    const layerHeight = Math.min(100, 272 / recipe.flavors.length);
    recipe.flavors.forEach((selection, index) => {
      const y = 436 + (recipe.flavors.length / 2 - index - 1) * layerHeight;
      ctx.fillStyle = flavors[selection ?? 4].sponge;
      ctx.fillRect(280, y, 340, layerHeight - 9);
      ctx.fillStyle = flavors[selection ?? 4].icing;
      ctx.fillRect(280, y, 340, 12);
    });
  }

  perforation(626);
  write(cakeFormationLabel(recipe), 116, 680, "bold 32px Georgia");
  write(recipe.formation === "triangle" ? "SLICES" : "LAYERS · BOTTOM TO TOP", 116, 728, "bold 19px monospace");
  recipe.flavors.forEach((selection, index) => {
    const flavor = flavors[selection ?? 4];
    const y = 776 + index * 45;
    write(String(index + 1).padStart(2, "0"), 116, y, "23px monospace");
    write(flavor.name, 182, y, "26px sans-serif");
    ctx.fillStyle = flavor.icing;
    ctx.beginPath();
    ctx.arc(769, y - 9, 12, 0, Math.PI * 2);
    ctx.fill();
  });
  perforation(height - 144);
  write("Your flavor. Your formation.", 450, height - 87, "italic 31px Georgia", "center");

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not export the receipt image");
  return new File([blob], "formeslice-cake-receipt.png", { type: "image/png" });
}

export function downloadCakeReceipt(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
