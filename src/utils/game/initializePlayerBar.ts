import { getPlayerBar } from "../../dom";
import { easeInQuad, easeOutBounce } from "../easing";
import { registerRenderer } from "./renderer";

export function initializePlayerBar({ barSize }: { barSize: number }) {
  let duration = 0;
  let position = 0;
  let startPosition = 0;
  let startTime = 0;
  let stopPosition = 0;

  const element = getPlayerBar();
  element.style.setProperty("--size", `${Math.round(barSize * 100)}%`);

  const activate = () => {
    duration = (1 - position) * 750;
    startPosition = position;
    startTime = Date.now();
    stopPosition = 1;
  };

  const deactivate = () => {
    duration = position * 1_250;
    startPosition = position;
    startTime = Date.now();
    stopPosition = 0;
  };

  const unregisterRenderer = registerRenderer(() => {
    if (duration === 0) {
      return;
    }

    const elapsedTime = Math.min(1, (Date.now() - startTime) / duration);

    const adjustment =
      startPosition < stopPosition
        ? easeInQuad(elapsedTime)
        : easeOutBounce(elapsedTime);

    const nextPosition =
      startPosition + (stopPosition - startPosition) * adjustment;
    const nextSafePosition = Math.max(0, Math.min(1, nextPosition));

    if (position !== nextSafePosition) {
      position = nextSafePosition;

      const element = getPlayerBar();
      element.style.setProperty(
        "--position",
        `${Math.round(position * (1 - barSize) * 100)}%`
      );
    }

    if (Date.now() - startTime >= duration) {
      duration = 0;
    }
  });

  window.addEventListener("keydown", activate);
  window.addEventListener("keyup", deactivate);
  window.addEventListener("pointerdown", activate);
  window.addEventListener("pointerup", deactivate);

  return function destroy() {
    unregisterRenderer();

    window.removeEventListener("keydown", activate);
    window.removeEventListener("keyup", deactivate);
    window.removeEventListener("pointerdown", activate);
    window.removeEventListener("pointerup", deactivate);
  };
}
