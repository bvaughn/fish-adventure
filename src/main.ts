import { runDraw, runPreload, runSetup, unregisterAll } from "./drawing";
import { initBackground } from "./game/background";
import { initBubbles } from "./game/bubble";
import { initForeground } from "./game/foreground";
import { initNPCs } from "./game/npcs";
import { showTestHarness } from "./test";
import { initPlayer } from "./game/player";
import {
  isRunning,
  pause,
  reset as resetScheduler,
  schedule,
  start,
  start as startScheduler,
} from "./scheduler";
import { createCanvas } from "./utils/drawing/Canvas";

export const canvas = createCanvas({
  height: Math.min(window.innerHeight, 200),
  parentElement: document.getElementById("root") as HTMLDivElement,
});

window.addEventListener("keydown", (event: KeyboardEvent) => {
  switch (event.key) {
    case "Enter": {
      if (isRunning()) {
        pause();
      } else {
        start();
      }
      break;
    }
  }
});

window.addEventListener("resize", () => {
  canvas.resize(window.innerWidth, Math.min(window.innerHeight, 200));
});

let stopGame: Function | null = null;

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
  stopGame = schedule((data) => {
    runDraw(canvas, data);
  });
  resetScheduler();
  startScheduler();
}

const url = new URL(window.location.href);
if (url.searchParams.has("test")) {
  showTestHarness();
} else {
  run();
}
