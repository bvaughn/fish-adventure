import { getPlayerBar } from "../../dom";
import { registerRenderer } from "../renderer";
import { createMoveable } from "../createMoveable";
import { arrowKeyWatcher } from "../arrowKeyWatcher";

export function initializePlayerBar({
  accelerationRate = 3,
  barSize,
  friction = 1,
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
  // TODO Cap min/max based on measured bar size

  const movableX = createMoveable({
    friction,
    initialPosition: initialX,
    maxPosition: 1,
    minPosition: 0,
    maxVelocity,
    minVelocity: -maxVelocity,
  });
  const movableY = createMoveable({
    friction,
    initialPosition: initialY,
    maxPosition: 1,
    minPosition: 0,
    maxVelocity,
    minVelocity: -maxVelocity,
  });

  const barElement = getPlayerBar();
  barElement.style.setProperty("--size", `${barSize}rem`);
  barElement.style.setProperty("--position", "0%");

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
