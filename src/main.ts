import { runDraw, runPreload, runSetup } from "./drawing";
import { initBackground } from "./game/background";
import { initForeground } from "./game/foreground";
import {
  schedule,
  reset as resetScheduler,
  start as startScheduler,
} from "./scheduler";
import { createCanvas } from "./utils/drawing/Canvas";

export const canvas = createCanvas({
  height: 400,
  parentElement: document.getElementById("root") as HTMLDivElement,
});

window.addEventListener("resize", () => {
  canvas.resize(window.innerWidth, window.innerHeight);
});

async function run() {
  // Module initialization
  // Note that order is important because it can impact drawing order (aka z-index)
  initBackground();
  // (["smallest", "small", "regular"] as const).forEach((size) => {
  //   for (let index = 0; index < 3; index++) {
  //     initNpcFish(size);
  //   }
  // });
  // initPlayerFish();
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
