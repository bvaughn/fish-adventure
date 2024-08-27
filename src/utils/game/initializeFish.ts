import { getFish, getWater } from "../../dom";
import { calculateAngle } from "../calculateAngle";
import { createNoise } from "../createNoise";
import { registerRenderer } from "../renderer";

const DEGREES_OFFSET = 90;

export function initializeFish({ speed = 0.0025 }: { speed?: number } = {}) {
  let positionX = 0;
  let positionY = 0;

  const noise = createNoise();

  // TODO Occasionally make the fish rest
  // TODO Rotate the fish in the direction it's "moving"

  // Don't let the bar go past the edge of the water (visually)
  const waterElement = getWater();
  const waterRect = waterElement.getBoundingClientRect();
  const fishElement = getFish();
  const fishRect = fishElement.getBoundingClientRect();

  const fishHeightPercentage = fishRect.height / waterRect.height;
  const fishWidthPercentage = fishRect.width / waterRect.width;

  let prevX = 0;
  let prevY = 0;
  const updateDOM = () => {
    const scaledPositionX =
      fishWidthPercentage / 2 + positionX * (1 - fishWidthPercentage);
    const scaledPositionY =
      fishHeightPercentage / 2 + positionY * (1 - fishHeightPercentage);

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
