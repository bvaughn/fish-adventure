import { Canvas } from "../utils/drawing/Canvas";
import { getSchedulerData, SchedulerData } from "./scheduler";

type RenderCallback = (schedulerData: SchedulerData, canvas: Canvas) => void;
type ResizeCallback = (canvas: Canvas) => void;
type PreRenderCallback = (schedulerData: SchedulerData) => void;

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
  npc: [] as Array<PreRenderCallback>,
  player: [] as Array<PreRenderCallback>,
  render: new Array(LAYERS.length)
    .fill(true)
    .map(() => []) as RenderCallback[][],
  resize: [] as Array<ResizeCallback>,
  scene: [] as Array<PreRenderCallback>,
};

export function handleResize(callback: ResizeCallback) {
  return registerCallbackHelper(callback, callbacks.resize);
}

export function getCurrentLayer(): Layer | null {
  return currentLayer;
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

export function scheduleNPCPreRenderUpdate(callback: PreRenderCallback) {
  return registerCallbackHelper(callback, callbacks.npc);
}

export function schedulePlayerPreRenderUpdate(callback: PreRenderCallback) {
  return registerCallbackHelper(callback, callbacks.player);
}

export function scheduleSceneSetupPreRenderUpdate(callback: PreRenderCallback) {
  return registerCallbackHelper(callback, callbacks.scene);
}

export function scheduleRenderWork(callback: RenderCallback, layer: Layer) {
  let layerCallbacks = callbacks.render[layer];
  if (layerCallbacks == null) {
    layerCallbacks = callbacks.render[layer] = [];
  }

  return registerCallbackHelper(callback, layerCallbacks);
}

export function unregisterAll() {
  callbacks.npc = [];
  callbacks.player = [];
  callbacks.render = new Array(LAYERS.length).fill(true).map(() => []);
  callbacks.resize = [];
  callbacks.scene = [];
}

export function runRenderPipeline(canvas: Canvas) {
  canvas.clear();

  const schedulerData = getSchedulerData();

  callbacks.scene.forEach((callback) => callback(schedulerData));
  callbacks.npc.forEach((callback) => callback(schedulerData));
  callbacks.player.forEach((callback) => callback(schedulerData));

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
