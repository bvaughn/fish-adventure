import { getFish, getWater } from "../../dom";
import { perlin2 as noise, seed } from "../noise";
import { registerRenderer } from "../renderer";

export function initializeFish({ speed = 0.0025 }: { speed?: number } = {}) {
  let calculatedSize = 0;
  let frameOffset = 0;
  let position = 0;

  seed(Math.random());

  // TODO It would also be good to stop the fish after a little while and then re-seed and restart it.

  // TODO This is hacky because it's wasteful and might not even be close to 0
  {
    let minPosition = Number.MAX_VALUE;
    let frameCountStart = 0;

    for (let index = 0; index < 1000; index++) {
      const value = noise(0, speed * index);
      if (value < minPosition) {
        minPosition = value;
        frameCountStart = index;

        if (value === 0) {
          break;
        }
      }
    }

    frameOffset = frameCountStart;
    position = minPosition;
  }

  const waterElement = getWater();
  const fishElement = getFish();

  const waterHeight = waterElement.clientHeight;
  const fishHeight = fishElement.clientHeight;

  calculatedSize = fishHeight / waterHeight;

  const updateDOM = () => {
    const scaledPosition = position * (1 - calculatedSize);

    fishElement.style.setProperty(
      "--position",
      `${Math.round(scaledPosition * 100)}%`
    );
  };

  const unregisterRenderer = registerRenderer(({ frameNumber }) => {
    frameNumber += frameOffset;

    const nextPosition = noise(0, speed * frameNumber);
    if (position != nextPosition) {
      position = nextPosition;

      updateDOM();
    }
  });

  updateDOM();

  return function destroy() {
    unregisterRenderer();
  };
}
