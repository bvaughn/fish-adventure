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
  npc: new Set<PreRenderCallback>(),
  player: new Set<PreRenderCallback>(),
  render: new Array(LAYERS.length)
    .fill(true)
    .map(() => new Set<RenderCallback>()),
  resize: new Set<ResizeCallback>(),
  scene: new Set<PreRenderCallback>(),
};

export function handleResize(callback: ResizeCallback) {
  return registerCallbackHelper(callback, callbacks.resize);
}

export function getCurrentLayer(): Layer | null {
  return currentLayer;
}

function registerCallbackHelper(callback: Function, callbacks: Set<Function>) {
  callbacks.add(callback);

  return function unregister() {
    callbacks.delete(callback);
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
  return registerCallbackHelper(callback, callbacks.render[layer]);
}

export function unregisterAll() {
  callbacks.npc.clear();
  callbacks.player.clear();
  callbacks.render.forEach((layerCallbacks) => layerCallbacks.clear());
  callbacks.resize.clear();
  callbacks.scene.clear();
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
    drawCallbacks.forEach((callback) => callback(schedulerData, canvas));
  });

  currentLayer = null;
}

export function callResizeHandlers(canvas: Canvas) {
  callbacks.resize.forEach((callback) => callback(canvas));
}
