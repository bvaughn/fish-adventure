import { getFish, getWater } from "../../dom";
import { Fish } from "../../types";
import { perlin2 as noise, seed } from "../noise";

export function initializeFish(fish: Fish) {
  seed(Math.random());

  let minPosition = Number.MAX_VALUE;
  let frameCountStart = 0;

  // This is kind of hacky because it's wasteful and might not even be close to 0
  for (let index = 0; index < 1000; index++) {
    const value = noise(0, 0.01 * index);
    if (value < minPosition) {
      minPosition = value;
      frameCountStart = index;

      if (value === 0) {
        break;
      }
    }
  }

  fish.frameCount = frameCountStart;
  fish.position = minPosition;

  const waterElement = getWater();
  const fishElement = getFish();

  const waterHeight = waterElement.clientHeight;
  const fishHeight = fishElement.clientHeight;

  fish.calculatedSize = fishHeight / waterHeight;
}

export function updateFish(fish: Fish) {
  fish.frameCount++;

  const position = noise(0, 0.01 * fish.frameCount);
  if (fish.position != position) {
    fish.position = position;

    updateFishDOM(fish);
  }
}

export function updateFishDOM(fish: Fish): void {
  const scaledPosition = fish.position * (1 - fish.calculatedSize);

  const element = getFish();
  element.style.setProperty(
    "--position",
    `${Math.round(scaledPosition * 100)}%`
  );
}
