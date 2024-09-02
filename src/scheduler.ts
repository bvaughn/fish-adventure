import raf from "raf";
import { FRAME_RATE } from "./constants";

export type SchedulerData = {
  frameNumber: number;
  timeSinceLastFrameMs: number;
  timestamp: number;
  timeTotalMs: number;
};

export type Callback = (data: SchedulerData) => void;
export type CancelScheduled = () => void;

// Shared global state
export let frameNumber = 0;
export let timeSinceLastFrameMs: number = 0;
export let timestamp: number = 0;
export let timeTotalMs: number = 0;

let animationFrameId: number | null = null;
let lastAnimationFrameTime = performance.now();
let scheduledCallbacks: Callback[] = [];
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
  timeTotalMs = 0;
}

export function start() {
  if (animationFrameId !== null || timeoutId !== null) {
    return;
  }

  lastAnimationFrameTime = performance.now();

  animationFrameId = raf(onAnimationFrame);
}

export function schedule(callback: Callback) {
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

  timestamp = performance.now();
  timeSinceLastFrameMs = timestamp - lastAnimationFrameTime;

  frameNumber++;
  lastAnimationFrameTime = timestamp;
  timeTotalMs += timeSinceLastFrameMs;

  scheduledCallbacks.forEach((callback) => {
    callback({
      frameNumber,
      timeSinceLastFrameMs,
      timestamp,
      timeTotalMs,
    });
  });

  timeoutId = setTimeout(onTimeout, 1_000 / FRAME_RATE);
}

function onTimeout() {
  timeoutId = null;
  animationFrameId = raf(onAnimationFrame);
}
