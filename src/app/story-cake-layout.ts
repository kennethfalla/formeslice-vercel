import { storyCakeFlavors } from "./cake-recipe";

export type StoryCakePose = { separation: number; chapter: number };

export function getStoryLayers(chapter: number) {
  let top = .075;
  return storyCakeFlavors.map((_, index) => {
    const emphasis = Math.max(0, 1 - Math.abs(index - chapter));
    const height = .09 + emphasis * .35;
    const layer = { top, height, emphasis };
    top += height + .035;
    return layer;
  });
}
