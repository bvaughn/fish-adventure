import { SchedulerData } from "./scheduler";
import { Canvas } from "./utils/drawing/Canvas";

type DrawCallback = (schedulerData: SchedulerData, canvas: Canvas) => void;
type PreloadCallback = () => void | Promise<void>;
type ResizeCallback = (canvas: Canvas) => void;
type SetupCallback = () => void;

export type Layer = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export const BACKGROUND_LAYER_1 = 0;
export const BACKGROUND_LAYER_2 = 1;
export const BACKGROUND_LAYER_3 = 2;
export const PLAYER_LAYER_UNDERLAY = 3;
export const PLAYER_LAYER = 4;
export const PLAYER_LAYER_OVERLAY = 5;
export const FOREGROUND_LAYER = 6;

const callbacks = {
  draw: new Array<Array<DrawCallback>>([], [], [], [], [], [], []),
  preload: [] as Array<PreloadCallback>,
  resize: [] as Array<ResizeCallback>,
  setup: [] as Array<SetupCallback>,
};

export function registerDraw(callback: DrawCallback, layer: Layer) {
  let layerCallbacks = callbacks.draw[layer];
  if (layerCallbacks == null) {
    layerCallbacks = callbacks.draw[layer] = [];
  }

  return registerCallbackHelper(callback, layerCallbacks);
}

export function registerPreload(callback: PreloadCallback) {
  // TODO Error if called after runPreload
  return registerCallbackHelper(callback, callbacks.preload);
}

export function registerResize(callback: ResizeCallback) {
  return registerCallbackHelper(callback, callbacks.resize);
}

export function registerSetup(callback: SetupCallback) {
  // TODO Error if called after runSetup
  return registerCallbackHelper(callback, callbacks.setup);
}

function registerCallbackHelper(callback: Function, callbacks: Function[]) {
  callbacks.push(callback);

  return function unregister() {
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  };
}

export async function runPreload() {
  for (const callback of callbacks.preload) {
    await callback();
  }
}

export function runDraw(canvas: Canvas, schedulerData: SchedulerData) {
  // TODO Respect framerate
  for (const drawCallbacks of callbacks.draw) {
    for (const callback of drawCallbacks) {
      callback(schedulerData, canvas);
    }
  }
}

export function runSetup() {
  for (const callback of callbacks.setup) {
    callback();
  }
}

export function runResize(canvas: Canvas) {
  // TODO This causes a flicker for some reason
  for (const callback of callbacks.resize) {
    callback(canvas);
  }
}
