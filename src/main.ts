import { getContainer, getStartFishingButton } from "./dom";
import { initializeFish } from "./utils/game/initializeFish";
import { initializeMeter } from "./utils/game/initializeMeter";
import { initializePlayerBar } from "./utils/game/initializePlayerBar";
import { startRendering, stopRendering } from "./utils/game/renderer";

function run() {
  const container = getContainer();
  container.setAttribute("data-status", "fishing");

  const destroyFish = initializeFish({
    speed: 0.0025,
  });

  const destroyPlayerBar = initializePlayerBar({
    barSize: 0.25,
  });

  const destroyMeter = initializeMeter({
    onComplete: (won: boolean) => {
      stopRendering();

      destroyFish();
      destroyMeter();
      destroyPlayerBar();

      container.setAttribute("data-status", won ? "won" : "lost");
    },
  });

  startRendering();
}

const button = getStartFishingButton();
button.addEventListener("click", run);
