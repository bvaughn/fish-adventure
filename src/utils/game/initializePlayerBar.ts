import { getPlayerBar, getWater } from "../../dom";
import { registerRenderer } from "../renderer";
import { createMoveable } from "../createMoveable";
import { arrowKeyWatcher } from "../arrowKeyWatcher";

export function initializePlayerBar({
  accelerationRate = 8,
  barSize,
  friction = 6,
  initialX = 0,
  initialY = 0,
  maxVelocity = 1,
}: {
  accelerationRate?: number;
  barSize: number;
  friction?: number;
  initialX?: number;
  initialY?: number;
  maxVelocity?: number;
}) {
  const barElement = getPlayerBar();
  barElement.style.setProperty("--size", `${barSize}rem`);
  barElement.style.setProperty("--position", "0%");

  // Don't let the bar go past the edge of the water (visually)
  const waterElement = getWater();
  const waterRect = waterElement.getBoundingClientRect();
  const barRect = barElement.getBoundingClientRect();
  const barHeightPercentage = barRect.height / waterRect.height;
  const barWidthPercentage = barRect.width / waterRect.width;

  const movableX = createMoveable({
    friction,
    initialPosition: initialX,
    maxPosition: 1 - barWidthPercentage / 2,
    minPosition: barWidthPercentage / 2,
    maxVelocity,
    minVelocity: -maxVelocity,
  });
  const movableY = createMoveable({
    friction,
    initialPosition: initialY,
    maxPosition: 1 - barHeightPercentage / 2,
    minPosition: barHeightPercentage / 2,
    maxVelocity,
    minVelocity: -maxVelocity,
  });

  const destroyArrowKeyWatcher = arrowKeyWatcher((leftRight, upDown) => {
    switch (leftRight) {
      case "left": {
        movableX.setAcceleration(-accelerationRate);
        break;
      }
      case "right": {
        movableX.setAcceleration(accelerationRate);
        break;
      }
      default: {
        movableX.setAcceleration(0);
        break;
      }
    }

    switch (upDown) {
      case "down": {
        movableY.setAcceleration(-accelerationRate);
        break;
      }
      case "up": {
        movableY.setAcceleration(accelerationRate);
        break;
      }
      default: {
        movableY.setAcceleration(0);
        break;
      }
    }
  });

  const unregisterRenderer = registerRenderer(() => {
    barElement.style.setProperty(
      "--position-x",
      `${Math.round(movableX.getPosition() * 100)}%`
    );
    barElement.style.setProperty(
      "--position-y",
      `${Math.round(movableY.getPosition() * 100)}%`
    );
  });

  // window.addEventListener("keyup", onKeyUp);
  // window.addEventListener("keydown", onKeyDown);

  return function destroy() {
    unregisterRenderer();

    // window.removeEventListener("keydown", onKeyDown);
    // window.removeEventListener("keyup", onKeyUp);
    destroyArrowKeyWatcher();
  };
}
