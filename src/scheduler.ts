import raf from "raf";

export type SchedulerData = {
  frameNumber: number;
  timeSinceLastFrameMs: number;
  timestamp: number;
  timeTotalMs: number;
};

export type Callback = (data: SchedulerData) => void;
export type CancelScheduled = () => void;

let animationFrameId: number | null = null;
let frameNumber = 0;
let lastAnimationFrameTime = performance.now();
let scheduledCallbacks: Callback[] = [];
let timeTotalMs = 0;

export function pause() {
  if (animationFrameId !== null) {
    raf.cancel(animationFrameId);
    animationFrameId = null;
  }
}

export function reset() {
  frameNumber = 0;
  lastAnimationFrameTime = performance.now();
  timeTotalMs = 0;
}

export function start() {
  if (animationFrameId !== null) {
    return;
  }

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

  const currentTime = performance.now();
  const elapsedTime = currentTime - lastAnimationFrameTime;

  frameNumber++;
  lastAnimationFrameTime = elapsedTime;
  timeTotalMs += elapsedTime;

  scheduledCallbacks.forEach((callback) => {
    callback({
      frameNumber,
      timeSinceLastFrameMs: elapsedTime,
      timestamp: currentTime,
      timeTotalMs,
    });
  });
}
