import { CancelScheduled, schedule } from "./scheduler";

export type Renderer = (data: {
  frameNumber: number;
  timeSinceLastFrameMs: number;
  timeTotalMs: number;
}) => void;

const renderers = new Set<Renderer>();

export function registerRenderer(renderer: Renderer) {
  renderers.add(renderer);

  return function unregister(): void {
    renderers.delete(renderer);
  };
}

export function unregisterAllRenderers(): void {
  renderers.clear();
}

let cancelScheduled: CancelScheduled | null = null;
let isRendering = false;
let frameNumber = 0;
let lastAnimationFrameTime = 0;
let timeSinceLastFrameMs = 0;
let timeTotalMs = 0;

function draw() {
  const data = {
    frameNumber,
    timeSinceLastFrameMs,
    timeTotalMs,
  };

  renderers.forEach((renderer) => {
    renderer(data);
  });
}

export function startRendering() {
  lastAnimationFrameTime = Date.now();

  isRendering = true;

  draw();

  cancelScheduled = schedule(onAnimationFrame);
}

export function pauseRendering() {
  isRendering = false;

  if (cancelScheduled) {
    cancelScheduled();
  }
}

export function stopRendering() {
  timeTotalMs = 0;
  frameNumber = 0;
  isRendering = false;
  lastAnimationFrameTime = 0;

  if (cancelScheduled) {
    cancelScheduled();
  }
}

function onAnimationFrame() {
  if (!isRendering) {
    return;
  }

  frameNumber++;
  timeSinceLastFrameMs = Date.now() - lastAnimationFrameTime;
  timeTotalMs += timeSinceLastFrameMs;

  draw();

  lastAnimationFrameTime = Date.now();

  cancelScheduled = schedule(onAnimationFrame);
}
