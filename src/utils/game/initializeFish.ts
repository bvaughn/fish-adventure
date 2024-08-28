import { getWater } from "../../dom";
import { calculateAngle } from "../calculateAngle";
import { calculateMovement } from "../calculateMovement";
import { createNoise } from "../createNoise";
import { registerRenderer } from "../renderer";

export type FishAPI = ReturnType<typeof initializeFish>;

let initialOffsetCounter = 0;

const DEGREES_OFFSET = 90;

export function initializeFish({
  type,
  velocityPixelsPerSecond = 100,
}: {
  type: string;
  velocityPixelsPerSecond?: number;
}) {
  initialOffsetCounter += 10;

  const noise = createNoise();

  // TODO Occasionally make the fish rest

  const waterElement = getWater();
  const waterRect = waterElement.getBoundingClientRect();

  const fishElement = document.createElement("div");
  fishElement.className = "fish";
  fishElement.style.backgroundImage = `url(/images/fish-${type}.png)`;

  waterElement.appendChild(fishElement);

  const fishRect = fishElement.getBoundingClientRect();
  let positionX = fishRect.width / 2;
  let positionY = fishRect.height / 2;

  let prevX = 0;
  let prevY = 0;
  const updateDOM = () => {
    fishElement.style.setProperty(
      "--position-x",
      `${positionX * (waterRect.width - fishRect.width)}px`
    );
    fishElement.style.setProperty(
      "--position-y",
      `${positionY * (waterRect.height - fishRect.height)}px`
    );

    const deltaX = positionX - prevX;
    const deltaY = positionY - prevY;

    // TODO Don't flip upside down; reverse X axis
    const rotation = calculateAngle(deltaX, deltaY * -1, DEGREES_OFFSET);
    fishElement.style.setProperty("--rotation", `${Math.round(rotation)}deg`);

    if (deltaX < 0) {
      fishElement.setAttribute("data-invert", "true");
    } else {
      fishElement.removeAttribute("data-invert");
    }

    prevX = positionX;
    prevY = positionY;
  };

  let scaledX = 0;
  let scaledY = 0;

  const unregisterRenderer = registerRenderer(({ timeSinceLastFrameMs }) => {
    // Don't let the bar go past the edge of the water (visually)

    scaledX += calculateMovement({
      sizeInPixels: waterRect.width - fishRect.width,
      timeInMilliseconds: timeSinceLastFrameMs,
      velocityPixelsPerSecond,
    });
    scaledY += calculateMovement({
      sizeInPixels: waterRect.height - fishRect.width,
      timeInMilliseconds: timeSinceLastFrameMs,
      velocityPixelsPerSecond,
    });

    positionX = noise.getValue(scaledX, initialOffsetCounter);
    positionY = noise.getValue(initialOffsetCounter, scaledY);

    updateDOM();
  });

  updateDOM();

  function destroy() {
    unregisterRenderer();
  }

  function getPosition(): [x: number, y: number] {
    return [positionX, positionY];
  }

  return {
    destroy,
    getPosition,
  };
}
