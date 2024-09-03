import { Canvas } from "../utils/drawing/Canvas";
import { SchedulerData } from "./scheduler";

type DrawCallback = (schedulerData: SchedulerData, canvas: Canvas) => void;
type ResizeCallback = (canvas: Canvas) => void;

export type Layer = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export const BACKGROUND_LAYER_1 = 0;
export const BACKGROUND_LAYER_2 = 1;
export const BACKGROUND_LAYER_3 = 2;
export const PLAYER_LAYER_UNDERLAY = 3;
export const PLAYER_LAYER = 4;
export const PLAYER_LAYER_OVERLAY = 5;
export const FOREGROUND_LAYER_1 = 6;
export const FOREGROUND_LAYER_2 = 7;

let currentLayerIndex: number | null = null;

const callbacks = {
  render: new Array<Array<DrawCallback>>([], [], [], [], [], [], []),
  resize: [] as Array<ResizeCallback>,
};

export function handleResize(callback: ResizeCallback) {
  return registerCallbackHelper(callback, callbacks.resize);
}

export function registerRenderFunction(callback: DrawCallback, layer: Layer) {
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
  callbacks.render = new Array<Array<DrawCallback>>([], [], [], [], [], [], []);
  callbacks.resize = [];
}

export function callRenderFunctions(
  canvas: Canvas,
  schedulerData: SchedulerData
) {
  // TODO Respect framerate

  for (let index = 0; index < callbacks.render.length; index++) {
    currentLayerIndex = index;

    const drawCallbacks = callbacks.render[index];

    for (const callback of drawCallbacks) {
      callback(schedulerData, canvas);
    }
  }

  currentLayerIndex = null;
}

export function callResizeHanlders(canvas: Canvas) {
  // TODO This causes a flicker for some reason
  for (const callback of callbacks.resize) {
    callback(canvas);
  }
}
