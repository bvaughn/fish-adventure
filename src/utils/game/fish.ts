import { getFish, getWater } from "../../dom";
import { Fish } from "../../types";
import { easeInQuad } from "../easing";

export function initializeFish(fish: Fish) {
  const waterElement = getWater();
  const fishElement = getFish();

  const waterHeight = waterElement.clientHeight;
  const fishHeight = fishElement.clientHeight;

  fish.calculatedSize = fishHeight / waterHeight;
}

export function updateFish(fish: Fish) {
  const currentTime = Date.now();

  if (currentTime > fish.moveTimeStop) {
    // Stopped moving; calculate the next rest and movement values

    // Move to the final position
    fish.position = fish.positionStop;
    updateFishDOM(fish);

    // Random but more likely to move away from the nearest edge
    const moveUp = Math.random() > fish.position;

    // Random within the available space
    // const deltaMin = moveUp ? 0.2 : -0.2;
    const deltaMax = moveUp ? 1 - fish.position : 0 - fish.position;
    const delta = Math.random() * deltaMax;

    // Random duration based on the fish's max velocity
    const minDuration = Math.abs(1_000 * delta);
    const duration = minDuration + Math.random() * 1_000;

    // Store cached values for the next movement
    fish.moveTimeStart = currentTime + Math.random() * 1_000;
    fish.moveTimeStop = fish.moveTimeStart + duration;
    fish.positionStart = fish.position;
    fish.positionStop = fish.position + delta;
  } else if (currentTime >= fish.moveTimeStart) {
    // Actively moving
    const totalTime = fish.moveTimeStop - fish.moveTimeStart;
    const timeElapsed = currentTime - fish.moveTimeStart;

    const value = timeElapsed / totalTime;
    const easedValue = easeInQuad(Math.min(1, value));

    const position =
      fish.positionStart +
      (fish.positionStop - fish.positionStart) * easedValue;
    const safePosition = Math.max(0, Math.min(1, position));
    if (fish.position != safePosition) {
      fish.position = safePosition;
      updateFishDOM(fish);
    }
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
