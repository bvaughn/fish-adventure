import { getFish, getMeterBar, getPlayerBar } from "../../dom";
import { getGradientHexColor } from "../color";
import { registerRenderer } from "../renderer";
import { FishAPI } from "./initializeFish";

// Maybe make this a shooting game instead?
// "Shooting fish in a barrel"?

// TODO Rate the fishing based on how often the fish is outside of the bar.

export function initializeMeter({
  fish,
  onComplete,
  timeToCatchMs = 3_000,
  timeToEscapeMs = 2_000,
}: {
  fish: FishAPI[];
  onComplete?: (won: boolean) => void;
  timeToCatchMs?: number;
  timeToEscapeMs?: number;
}) {
  return;
  let fishingProgress = 0.2;

  const fishElement = getFish()[0];
  const barElement = getPlayerBar();
  const element = getMeterBar();

  const computedStyle = getComputedStyle(element);
  const colorStart = computedStyle.getPropertyValue("--color-empty");
  const colorEnd = computedStyle.getPropertyValue("--color-full");

  const updateDOM = (progress: number) => {
    element.style.setProperty(
      "--color",
      getGradientHexColor(fishingProgress, colorStart, colorEnd)
    );
    element.style.setProperty("--size", `${Math.round(progress * 100)}%`);
  };

  const timeToCatchPerSecond = 1_000 / timeToCatchMs;
  const timeToEscapePerSecond = 1_000 / timeToEscapeMs;

  const unregisterRenderer = registerRenderer(({ timeSinceLastFrameMs }) => {
    const fishRect = fishElement.getBoundingClientRect();
    const barRect = barElement.getBoundingClientRect();

    const intersects = !(
      barRect.bottom < fishRect.top || barRect.top > fishRect.bottom
    );

    const deltaSinceLastFrame = intersects
      ? (timeSinceLastFrameMs / 1_000) * timeToCatchPerSecond
      : (timeSinceLastFrameMs / 1_000) * -timeToEscapePerSecond;

    fishingProgress = Math.max(
      0,
      Math.min(1, fishingProgress + deltaSinceLastFrame)
    );

    updateDOM(fishingProgress);

    if (fishingProgress === 0 || fishingProgress === 1) {
      onComplete?.(fishingProgress === 1);
    }
  });

  updateDOM(0.2);

  return function destroy() {
    unregisterRenderer();
  };
}
