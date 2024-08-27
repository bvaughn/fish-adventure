import { getFish, getWater } from "../../dom";
import { calculateAngle } from "../calculateAngle";
import { createNoise } from "../createNoise";
import { registerRenderer } from "../renderer";

const DEGREES_OFFSET = 90;

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

  let prevX = 0;
  let prevY = 0;
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

    const deltaX = positionX - prevX;
    const deltaY = positionY - prevY;

    const rotation = calculateAngle(deltaX, deltaY * -1, DEGREES_OFFSET);

    document.getElementById("debug")!.innerText =
      `${positionX.toFixed(3)}, ${positionY.toFixed(3)} -> ${rotation.toFixed(3)}`;

    fishElement.style.setProperty("--rotation", `${Math.round(rotation)}deg`);

    prevX = positionX;
    prevY = positionY;
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
