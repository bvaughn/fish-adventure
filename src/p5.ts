import P5 from "p5";

export type Callback = (api: P5) => void;

const drawCallbacks: Callback[] = [];
const preloadCallbacks: Callback[] = [];
const setupCallbacks: Callback[] = [];

export const size = {
  height: 0,
  pixelScale: 5,
  width: 0,
};

export const api: P5 = new P5((api: P5) => {
  size.width = api.windowWidth;
  size.height = api.windowHeight;

  api.windowResized = () => {
    size.width = api.windowWidth;
    console.log("RESIZE", size.height, "->", api.windowHeight);
    size.height = api.windowHeight;

    api.resizeCanvas(size.width, size.height);
  };

  api.preload = () => {
    preloadCallbacks.forEach((callback) => callback(api));
  };

  api.setup = () => {
    api.frameRate(30);
    api.createCanvas(size.width, size.height);

    setupCallbacks.forEach((callback) => callback(api));
  };

  api.draw = () => {
    drawCallbacks.forEach((callback) => callback(api));
  };
});

export function registerDraw(callback: Callback) {
  drawCallbacks.push(callback);

  return function unregister() {
    const index = drawCallbacks.indexOf(callback);
    if (index !== -1) {
      drawCallbacks.splice(index, 1);
    }
  };
}

export function registerPreload(callback: Callback) {
  preloadCallbacks.push(callback);

  return function unregister() {
    const index = preloadCallbacks.indexOf(callback);
    if (index !== -1) {
      preloadCallbacks.splice(index, 1);
    }
  };
}

export function registerSetup(callback: Callback) {
  setupCallbacks.push(callback);

  return function unregister() {
    const index = setupCallbacks.indexOf(callback);
    if (index !== -1) {
      setupCallbacks.splice(index, 1);
    }
  };
}
