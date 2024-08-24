import { getPlayerBar } from "../../dom";
import { Fish, Fisherman } from "../../types";
import { easeInQuad } from "../easing";

export function initializeFisherman(fisherman: Fisherman) {
  // No-op
}

export function startFishing(fisherman: Fisherman) {
  const activate = () => {
    fisherman.isReeling = true;
    fisherman.reelStartPosition = fisherman.barPosition;
    fisherman.reelStartTime = Date.now();
  };
  const deactivate = () => {
    fisherman.isReeling = false;
    fisherman.reelStartPosition = fisherman.barPosition;
    fisherman.reelStartTime = Date.now();
  };

  const element = getPlayerBar();
  element.style.setProperty(
    "--size",
    `${Math.round(fisherman.barSize * 100)}%`
  );

  window.addEventListener("keydown", activate);
  window.addEventListener("keyup", deactivate);
  window.addEventListener("pointerdown", activate);
  window.addEventListener("pointerup", deactivate);

  return function stopListening() {
    window.removeEventListener("keydown", activate);
    window.removeEventListener("keyup", deactivate);
    window.removeEventListener("pointerdown", activate);
    window.removeEventListener("pointerup", deactivate);
  };
}

export function updateFisherman(fisherman: Fisherman) {
  const timeElapsed = Date.now() - fisherman.reelStartTime;
  const ease = easeInQuad(Math.min(1, timeElapsed / 500));

  const positionStart = fisherman.reelStartPosition;
  const positionStop = fisherman.isReeling ? 1 : 0;

  const position = positionStart + (positionStop - positionStart) * ease;
  const safePosition = Math.max(0, Math.min(1, position));

  fisherman.barPosition = safePosition;

  const element = getPlayerBar();
  element.style.setProperty(
    "--position",
    `${Math.round(fisherman.barPosition * (1 - fisherman.barSize) * 100)}%`
  );
}
