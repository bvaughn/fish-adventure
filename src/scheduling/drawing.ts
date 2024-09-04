import { Canvas } from "../utils/drawing/Canvas";
import { SchedulerData } from "./scheduler";

type DrawCallback = (schedulerData: SchedulerData, canvas: Canvas) => void;
type ResizeCallback = (canvas: Canvas) => void;

export type Layer = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const BACKGROUND_LAYER_1 = 0;
export const BACKGROUND_LAYER_2 = 1;
export const BACKGROUND_LAYER_3 = 2;
export const NPC_LAYER = 3;
export const PLAYER_LAYER_UNDERLAY = 4;
export const PLAYER_LAYER = 5;
export const PLAYER_LAYER_OVERLAY = 6;
export const FOREGROUND_LAYER = 7;

const LAYERS: Layer[] = [
  BACKGROUND_LAYER_1,
  BACKGROUND_LAYER_2,
  BACKGROUND_LAYER_3,
  NPC_LAYER,
  PLAYER_LAYER_UNDERLAY,
  PLAYER_LAYER,
  PLAYER_LAYER_OVERLAY,
  FOREGROUND_LAYER,
];

let currentLayer: Layer | null = null;

const callbacks = {
  render: new Array(LAYERS.length).fill(true).map(() => []) as DrawCallback[][],
  resize: [] as Array<ResizeCallback>,
};

export function handleResize(callback: ResizeCallback) {
  return registerCallbackHelper(callback, callbacks.resize);
}

export function getCurrentLayer(): Layer | null {
  return currentLayer;
}

export function scheduleRenderWork(callback: DrawCallback, layer: Layer) {
  let layerCallbacks = callbacks.render[layer];
  if (layerCallbacks == null) {
    layerCallbacks = callbacks.render[layer] = [];
  }

  return registerCallbackHelper(callback, layerCallbacks);
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

export function unregisterAll() {
  callbacks.render = new Array(LAYERS.length).fill(true).map(() => []);
  callbacks.resize = [];
}

export function callRenderFunctions(
  canvas: Canvas,
  schedulerData: SchedulerData
) {
  canvas.clear();

  LAYERS.forEach((layer, index) => {
    currentLayer = layer;

    const drawCallbacks = callbacks.render[index];
    for (const callback of drawCallbacks) {
      callback(schedulerData, canvas);
    }
  });

  currentLayer = null;
}

export function callResizeHandlers(canvas: Canvas) {
  for (const callback of callbacks.resize) {
    callback(canvas);
  }
}
