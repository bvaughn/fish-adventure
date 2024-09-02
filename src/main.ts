import { runDraw, runPreload, runSetup } from "./drawing";
import { initBackground } from "./game/background";
import { initBubbles } from "./game/bubble";
import { initForeground } from "./game/foreground";
import { initNPCs } from "./game/npcs";
import { initPlayer } from "./game/player";
import {
  reset as resetScheduler,
  schedule,
  start as startScheduler,
} from "./scheduler";
import { createCanvas } from "./utils/drawing/Canvas";

export const canvas = createCanvas({
  height: Math.min(window.innerHeight, 200),
  parentElement: document.getElementById("root") as HTMLDivElement,
});

window.addEventListener("resize", () => {
  canvas.resize(window.innerWidth, Math.min(window.innerHeight, 200));
});

async function run() {
  // Module initialization
  // Note that order is important because it can impact drawing order (aka z-index)
  initBackground();
  initNPCs();
  initBubbles();
  initPlayer();
  initForeground();

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
