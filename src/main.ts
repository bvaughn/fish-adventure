import { getContainer, getStartFishingButton } from "./dom";
import { initializeFish } from "./utils/game/initializeFish";
import { initializeMeter } from "./utils/game/initializeMeter";
import { initializePlayerBar } from "./utils/game/initializePlayerBar";
import { startRendering, stopRendering } from "./utils/renderer";

function run() {
  const container = getContainer();
  container.setAttribute("data-status", "fishing");

  // TODO Create several types of fish (visually different, different speeds)
  const destroyFish = initializeFish({
    speed: 0.0025,
  });

  const destroyPlayerBar = initializePlayerBar({
    barSize: 3,
    initialX: 0.5,
    initialY: 0.5,
  });

  const destroyMeter = initializeMeter({
    // TODO Pass fish references

    onComplete: (won: boolean) => {
      stopRendering();

      // TODO Animate watery background and bubbles

      destroyFish();
      destroyMeter();
      destroyPlayerBar();

      container.setAttribute("data-status", won ? "won" : "lost");

      stopRendering();
    },
  });

  startRendering();
}

const button = getStartFishingButton();
button.addEventListener("click", run);
