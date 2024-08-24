import { FISH_DEFAULTS, FISHERMAN_DEFAULTS } from "./constants";
import { getContainer, getStartFishingButton } from "./dom";
import { Fish, Fisherman } from "./types";
import { initializeFish, updateFish } from "./utils/game/fish";
import {
  initializeFisherman,
  startFishing,
  updateFisherman,
} from "./utils/game/fisherman";
import { updateMeter } from "./utils/game/meter";

function run() {
  const fish: Fish = {
    ...FISH_DEFAULTS,
  };

  const fisherman: Fisherman = {
    ...FISHERMAN_DEFAULTS,
  };

  if (fisherman.fishingProgress !== 0) {
    return;
  }

  const container = getContainer();
  container.setAttribute("data-status", "fishing");

  initializeFish(fish);
  initializeFisherman(fisherman);

  const stopFishing = startFishing(fisherman);

  const interval = setInterval(function onTick() {
    updateFisherman(fisherman);
    updateFish(fish);
    updateMeter(fisherman, fish);

    // End game condition
    switch (fisherman.fishingProgress) {
      case 0: {
        container.setAttribute("data-status", "lost");

        stopFishing();
        clearInterval(interval);
        break;
      }
      case 1: {
        container.setAttribute("data-status", "won");

        stopFishing();
        clearInterval(interval);
        break;
      }
    }
  }, 1_000 / 60);
}

const button = getStartFishingButton();
button.addEventListener("click", run);
