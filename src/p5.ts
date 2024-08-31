import P5 from "p5";

export type Callback = (api: P5) => void;

export type Layer = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const BACKGROUND_LAYER_1 = 0;
export const BACKGROUND_LAYER_2 = 1;
export const BACKGROUND_LAYER_3 = 2;
export const PLAYER_LAYER_UNDERLAY = 3;
export const PLAYER_LAYER = 4;
export const PLAYER_LAYER_OVERLAY = 5;
export const FOREGROUND_LAYER = 6;

const callbacks = {
  draw: new Array<Callback[]>(7),
  preload: [] as Callback[],
  resize: [] as Callback[],
  setup: [] as Callback[],
};

const MAX_HEIGHT = 250;

export const frameRate = 30;
export const size = {
  height: 0,
  pixelScale: 2,
  width: 0,
};

export const api: P5 = new P5((api: P5) => {
  size.width = api.windowWidth;
  size.height = Math.min(MAX_HEIGHT, api.windowHeight);

  api.windowResized = () => {
    size.width = api.windowWidth;
    size.height = Math.min(MAX_HEIGHT, api.windowHeight);

    api.resizeCanvas(size.width, size.height);

    callbacks.resize.forEach((callback) => callback(api));
  };

  api.preload = () => {
    callbacks.preload.forEach((callback) => callback(api));
  };

  api.setup = () => {
    api.frameRate(frameRate);
    api.createCanvas(size.width, size.height);

    callbacks.setup.forEach((callback) => callback(api));
  };

  api.draw = () => {
    callbacks.draw.forEach((layerCallbacks) => {
      layerCallbacks.forEach((callback) => {
        callback(api);
      });
    });
  };
});

export function registerDraw(callback: Callback, layer: Layer) {
  let layerCallbacks = callbacks.draw[layer];
  if (layerCallbacks == null) {
    layerCallbacks = callbacks.draw[layer] = [];
  }

  return registerCallbackHelper(callback, layerCallbacks);
}

export function registerPreload(callback: Callback) {
  return registerCallbackHelper(callback, callbacks.preload);
}

export function registerResize(callback: Callback) {
  return registerCallbackHelper(callback, callbacks.resize);
}

export function registerSetup(callback: Callback) {
  return registerCallbackHelper(callback, callbacks.setup);
}

function registerCallbackHelper(callback: Callback, callbacks: Callback[]) {
  callbacks.push(callback);

  return function unregister() {
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  };
}
