import { initBackground } from "./game/background";
import { initBubbles } from "./game/bubble";
import { initForeground } from "./game/foreground";
import { initNPCs } from "./game/npcs";
import { initPlayer } from "./game/player";
import { callRenderFunctions, callResizeHanlders } from "./scheduling/drawing";
import { runPreloadWork, runSetupWork } from "./scheduling/initialization";
import {
  frameNumber,
  isRunning,
  pause,
  reset as resetScheduler,
  schedule,
  start,
  start as startScheduler,
  timeSinceLastFrameMs,
  timestamp,
} from "./scheduling/scheduler";
import { showTestHarness } from "./test";
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

  callResizeHanlders(canvas);

  callRenderFunctions(canvas, {
    frameNumber,
    timeSinceLastFrameMs,
    timestamp,
  });
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
  await runPreloadWork();

  // Setup
  runSetupWork();

  // Start draw loop
  stopGame = schedule((data) => {
    callRenderFunctions(canvas, data);
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
