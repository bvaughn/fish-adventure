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

let animationFrameId: number | null = null;
let deltaTimeMs = 0;
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

export function resetRendering() {
  deltaTimeMs = 0;
  frameNumber = 0;
  lastAnimationFrameTime = 0;
}

export function startRendering() {
  lastAnimationFrameTime = Date.now();

  draw();

  animationFrameId = requestAnimationFrame(onAnimationFrame);
}

export function stopRendering() {
  if (animationFrameId != null) {
    cancelAnimationFrame(animationFrameId);
  }
}

function onAnimationFrame() {
  deltaTimeMs += Date.now() - lastAnimationFrameTime;
  frameNumber++;
  lastAnimationFrameTime = Date.now();

  draw();

  animationFrameId = requestAnimationFrame(onAnimationFrame);
}
