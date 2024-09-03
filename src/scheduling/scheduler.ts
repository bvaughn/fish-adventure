import raf from "raf";
import { FRAME_RATE } from "../constants";

export type SchedulerData = {
  frameNumber: number;
  timeSinceLastFrameMs: number;
  timestamp: number;
};

export type ScheduledCallback = (data: SchedulerData) => void;
export type CancelScheduledCallback = () => void;

// Shared global state used for rendering and game behavior
// All code should use these values (and never call performance.now() directly) to ensure pause/resume works correctly
export let frameNumber = 0;
export let timeSinceLastFrameMs: number = 0;
export let timestamp: number = 0;

let animationFrameId: number | null = null;
let lastAnimationFrameTime = performance.now();
let scheduledCallbacks: ScheduledCallback[] = [];
let timeoutId: NodeJS.Timeout | null = null;

export function isRunning() {
  return animationFrameId !== null || timeoutId !== null;
}

export function pause() {
  if (animationFrameId !== null) {
    raf.cancel(animationFrameId);
    animationFrameId = null;
  }

  if (timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
}

export function reset() {
  frameNumber = 0;
  lastAnimationFrameTime = performance.now();
  timestamp = 0;
}

// Ties animation code together with @sinonjs/fake-timers
export function runScheduler_forTestingOnly(now: number) {
  timeSinceLastFrameMs = now - lastAnimationFrameTime;

  frameNumber++;
  lastAnimationFrameTime = now;
  timestamp += timeSinceLastFrameMs;
}

export function start() {
  if (animationFrameId !== null || timeoutId !== null) {
    return;
  }

  lastAnimationFrameTime = performance.now();

  animationFrameId = raf(onAnimationFrame);
}

export function schedule(callback: ScheduledCallback) {
  scheduledCallbacks.push(callback);

  return function unregister(): void {
    const index = scheduledCallbacks.indexOf(callback);
    if (index !== -1) {
      scheduledCallbacks.splice(index, 1);
    }
  };
}

function onAnimationFrame() {
  if (animationFrameId == null) {
    return;
  }

  animationFrameId = null;

  const now = performance.now();
  timeSinceLastFrameMs = now - lastAnimationFrameTime;

  frameNumber++;
  lastAnimationFrameTime = now;
  timestamp += timeSinceLastFrameMs;

  scheduledCallbacks.forEach((callback) => {
    callback({
      frameNumber,
      timeSinceLastFrameMs,
      timestamp,
    });
  });

  timeoutId = setTimeout(onTimeout, 1_000 / FRAME_RATE);
}

function onTimeout() {
  timeoutId = null;
  animationFrameId = raf(onAnimationFrame);
}
