import { getFish, getWater } from "../../dom";
import { createNoise } from "../createNoise";
import { registerRenderer } from "../renderer";

export function initializeFish({ speed = 0.0025 }: { speed?: number } = {}) {
  let calculatedSize = 0;
  let positionX = 0;
  let positionY = 0;

  const noise = createNoise();

  // TODO Occasionally make the fish rest
  // TODO Rotate the fish in the direction it's "moving"

  const waterElement = getWater();
  const fishElement = getFish();

  const waterHeight = waterElement.clientHeight;
  const fishHeight = fishElement.clientHeight;

  calculatedSize = fishHeight / waterHeight;

  const updateDOM = () => {
    const scaledPositionX = positionX * (1 - calculatedSize);
    const scaledPositionY = positionY * (1 - calculatedSize);

    fishElement.style.setProperty(
      "--position-x",
      `${Math.round(scaledPositionX * 100)}%`
    );
    fishElement.style.setProperty(
      "--position-y",
      `${Math.round(scaledPositionY * 100)}%`
    );
  };

  const unregisterRenderer = registerRenderer(({ frameNumber }) => {
    positionX = noise.getValue(frameNumber * speed, 0);
    positionY = noise.getValue(0, frameNumber * speed);

    updateDOM();
  });

  updateDOM();

  return function destroy() {
    unregisterRenderer();
  };
}
