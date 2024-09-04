import { initBackground } from "./game/background";
import { initBubbles } from "./game/bubble";
import { initForeground } from "./game/foreground";
import { initNPCs } from "./game/npcs";
import { initPlayer } from "./game/player";
import { callResizeHandlers, runRenderPipeline } from "./scheduling/rendering";
import { runPreloadWork, runSetupWork } from "./scheduling/initialization";
import {
  isRunning,
  pause,
  reset as resetScheduler,
  schedule,
  start,
  start as startScheduler,
} from "./scheduling/scheduler";
import { showTestHarness } from "./test";
import { createCanvas } from "./utils/drawing/Canvas";
import { initializeSharedState } from "./game/sharedState";

export const canvas = createCanvas({
  height: Math.min(window.innerHeight, 200),
  parentElement: document.getElementById("root") as HTMLDivElement,
});

callResizeHandlers(canvas);

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

  callResizeHandlers(canvas);
  runRenderPipeline(canvas);
});

let stopGame: Function | null = null;

async function run() {
  initializeSharedState();

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
  stopGame = schedule(() => {
    runRenderPipeline(canvas);
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
