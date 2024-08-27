import { getPlayerBar } from "../../dom";
import { registerRenderer } from "../renderer";
import { createMoveable } from "../createMoveable";

export function initializePlayerBar({
  accelerationRate = 3,
  barSize,
  friction = 1,
  maxVelocity = 1,
}: {
  accelerationRate?: number;
  barSize: number;
  friction?: number;
  maxVelocity?: number;
}) {
  const movable = createMoveable({
    friction,
    maxPosition: 1,
    minPosition: 0,
    maxVelocity,
    minVelocity: -maxVelocity,
  });

  const barElement = getPlayerBar();
  barElement.style.setProperty("--size", `${Math.round(barSize * 100)}%`);
  barElement.style.setProperty("--position", "0%");

  const onKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowUp": {
        if (movable.getAcceleration() < accelerationRate) {
          movable.setAcceleration(accelerationRate);
        }

        event.preventDefault();
        break;
      }
      case "ArrowDown": {
        if (movable.getAcceleration() > -accelerationRate) {
          movable.setAcceleration(-accelerationRate);
        }

        event.preventDefault();
        break;
      }
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowUp": {
        if (movable.getAcceleration() === accelerationRate) {
          movable.setAcceleration(0);
        }
        break;
      }
      case "ArrowDown": {
        if (movable.getAcceleration() === -accelerationRate) {
          movable.setAcceleration(0);
        }
        break;
      }
    }
  };
  const unregisterRenderer = registerRenderer(() => {
    barElement.style.setProperty(
      "--position",
      `${Math.round(movable.getPosition() * (1 - barSize) * 100)}%`
    );
  });

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  return function destroy() {
    unregisterRenderer();

    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  };
}
