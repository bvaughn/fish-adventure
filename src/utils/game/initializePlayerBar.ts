import { getPlayerBar } from "../../dom";
import { registerRenderer } from "../renderer";
import { createMoveable } from "../createMoveable";

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

  const onKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown": {
        if (movableY.getAcceleration() > -accelerationRate) {
          movableY.setAcceleration(-accelerationRate);
        }

        event.preventDefault();
        break;
      }
      case "ArrowLeft": {
        if (movableX.getAcceleration() < accelerationRate) {
          movableX.setAcceleration(-accelerationRate);
        }

        event.preventDefault();
        break;
      }
      case "ArrowRight": {
        if (movableX.getAcceleration() > -accelerationRate) {
          movableX.setAcceleration(accelerationRate);
        }

        event.preventDefault();
        break;
      }
      case "ArrowUp": {
        if (movableY.getAcceleration() < accelerationRate) {
          movableY.setAcceleration(accelerationRate);
        }

        event.preventDefault();
        break;
      }
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown": {
        if (movableY.getAcceleration() === -accelerationRate) {
          movableY.setAcceleration(0);
        }
        break;
      }
      case "ArrowLeft": {
        if (movableX.getAcceleration() === -accelerationRate) {
          movableX.setAcceleration(0);
        }
        break;
      }
      case "ArrowRight": {
        if (movableX.getAcceleration() === accelerationRate) {
          movableX.setAcceleration(0);
        }
        break;
      }
      case "ArrowUp": {
        if (movableY.getAcceleration() === accelerationRate) {
          movableY.setAcceleration(0);
        }
        break;
      }
    }
  };
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

  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("keydown", onKeyDown);

  return function destroy() {
    unregisterRenderer();

    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  };
}
