import { runDraw, runPreload, runSetup } from "./drawing";
import { initBackground } from "./game/background";
import { initBubbles } from "./game/bubble";
import { initForeground } from "./game/foreground";
import { addNPC, initNPCs } from "./game/npcs";
import { initPlayer } from "./game/player";
import {
  reset as resetScheduler,
  schedule,
  start as startScheduler,
} from "./scheduler";
import { createCanvas } from "./utils/drawing/Canvas";

export const canvas = createCanvas({
  height: 150,
  parentElement: document.getElementById("root") as HTMLDivElement,
});

window.addEventListener("resize", () => {
  canvas.resize(window.innerWidth, Math.min(window.innerHeight, 250));
});

async function run() {
  // Module initialization
  // Note that order is important because it can impact drawing order (aka z-index)
  initBackground();
  initNPCs();
  initBubbles();
  initPlayer();
  initForeground();

  (["smallest", "small", "regular"] as const).forEach((size) => {
    for (let index = 0; index < 3; index++) {
      addNPC(size);
    }
  });

  // Preloading
  await runPreload();

  // Setup
  runSetup();

  // Start draw loop
  schedule((data) => {
    runDraw(canvas, data);
  });
  resetScheduler();
  startScheduler();
}

run();
