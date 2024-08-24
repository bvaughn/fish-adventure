import { getFish, getMeterBar, getPlayerBar } from "../../dom";
import { Fish, Fisherman } from "../../types";
import { getGradientHexColor } from "../color";

export function updateMeter(fisherman: Fisherman, fish: Fish): void {
  const fishElement = getFish();
  const fishRect = fishElement.getBoundingClientRect();

  const barElement = getPlayerBar();
  const barRect = barElement.getBoundingClientRect();

  const intersects = !(
    barRect.bottom < fishRect.top || barRect.top > fishRect.bottom
  );

  fisherman.fishingProgress = Math.max(
    0,
    Math.min(1, fisherman.fishingProgress + (intersects ? 0.005 : -0.005))
  );

  const element = getMeterBar();

  const computedStyle = getComputedStyle(element);
  const colorStart = computedStyle.getPropertyValue("--color-empty");
  const colorEnd = computedStyle.getPropertyValue("--color-full");
  const color = getGradientHexColor(
    fisherman.fishingProgress,
    colorStart,
    colorEnd
  );

  element.style.setProperty("--color", color);
  element.style.setProperty(
    "--size",
    `${Math.round(fisherman.fishingProgress * 100)}%`
  );
}
