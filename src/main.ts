import { FISH } from "./constants";
import { getContainer, getStartFishingButton } from "./dom";
import { initializeFish } from "./utils/game/initializeFish";
import { initializeMeter } from "./utils/game/initializeMeter";
import { initializePlayerBar } from "./utils/game/initializePlayerBar";
import { initializePlayerGun } from "./utils/game/initializePlayerGun";
import { startRendering, stopRendering } from "./utils/renderer";

function run() {
  const container = getContainer();
  container.setAttribute("data-status", "fishing");

  const fish = new Array(10).fill(true).map((_, index) =>
    initializeFish({
      type: FISH[index % FISH.length],
      velocityPixelsPerSecond: 50 + Math.random() * 50,
    })
  );

  const destroyPlayerGun = initializePlayerGun({ fish });

  // TODO Cleanup

  startRendering();
}

const button = getStartFishingButton();
button.addEventListener("click", run);

getContainer().className = "gaming"; // TODO
run(); // TODO
