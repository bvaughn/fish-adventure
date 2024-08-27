import { getFish, getMeterBar, getPlayerBar } from "../../dom";
import { getGradientHexColor } from "../color";
import { registerRenderer } from "../renderer";

export function initializeMeter({
  growSpeed = 0.0025,
  onComplete,
  shrinkSpeed = 0.004,
}: {
  growSpeed?: number;
  onComplete?: (won: boolean) => void;
  shrinkSpeed?: number;
} = {}) {
  let fishingProgress = 0.2;

  const fishElement = getFish();
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

  const unregisterRenderer = registerRenderer(() => {
    const fishRect = fishElement.getBoundingClientRect();
    const barRect = barElement.getBoundingClientRect();

    const intersects = !(
      barRect.bottom < fishRect.top || barRect.top > fishRect.bottom
    );

    fishingProgress = Math.max(
      0,
      Math.min(1, fishingProgress + (intersects ? growSpeed : 0 - shrinkSpeed))
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