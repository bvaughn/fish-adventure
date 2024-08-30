import P5 from "p5";

export type DrawCallback = (api: P5) => void;

const drawCallbacks: DrawCallback[] = [];

export const size = {
  height: 0,
  pixelScale: 5,
  width: 0,
};

export const api: P5 = new P5((api: P5) => {
  size.width = Math.min(600, api.windowWidth);
  size.height = Math.min(300, api.windowHeight);

  api.setup = () => {
    api.frameRate(30);
    api.createCanvas(size.width, size.height);
  };

  api.draw = () => {
    drawCallbacks.forEach((callback) => callback(api));
  };
});

export function registerDraw(callback: DrawCallback) {
  drawCallbacks.push(callback);

  return function unregister() {
    const index = drawCallbacks.indexOf(callback);
    if (index !== -1) {
      drawCallbacks.splice(index, 1);
    }
  };
}
