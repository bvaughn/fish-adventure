import raf from "raf";
import { CancelScheduled, schedule } from "./scheduler";

export type Renderer = (data: {
  deltaTimeMs: number;
  frameNumber: number;
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
let deltaTimeMs = 0;
let isRendering = false;
let lastAnimationFrameTime = 0;
let frameNumber = 0;

function draw() {
  const data = {
    deltaTimeMs,
    frameNumber,
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
  deltaTimeMs = 0;
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

  deltaTimeMs += Date.now() - lastAnimationFrameTime;
  frameNumber++;
  lastAnimationFrameTime = Date.now();

  draw();

  cancelScheduled = schedule(onAnimationFrame);
}
