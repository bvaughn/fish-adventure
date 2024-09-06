import { Canvas } from "../utils/drawing/Canvas";
import { getSchedulerData, SchedulerData } from "./scheduler";

type RenderCallback = (schedulerData: SchedulerData, canvas: Canvas) => void;
type ResizeCallback = (canvas: Canvas) => void;
type PreRenderCallback = (schedulerData: SchedulerData) => void;

export enum Layer {
  BACKGROUND_LAYER_1 = "BACKGROUND_LAYER_1",
  BACKGROUND_LAYER_2 = "BACKGROUND_LAYER_2",
  BACKGROUND_LAYER_3 = "BACKGROUND_LAYER_3",
  BACKGROUND_LAYER_4 = "BACKGROUND_LAYER_4",
  BACKGROUND_LAYER_5 = "BACKGROUND_LAYER_5",
  NPC_LAYER = "NPC_LAYER",
  PLAYER_LAYER_UNDERLAY = "PLAYER_LAYER_UNDERLAY",
  PLAYER_LAYER = "PLAYER_LAYER",
  PLAYER_LAYER_OVERLAY = "PLAYER_LAYER_OVERLAY",
  FOREGROUND_LAYER = "FOREGROUND_LAYER",
}

const LAYERS: Layer[] = Object.values(Layer);

let currentLayer: Layer | null = null;

const callbacks = {
  npc: new Set<PreRenderCallback>(),
  player: new Set<PreRenderCallback>(),
  render: new Map<Layer, Set<RenderCallback>>(),
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
  let layerCallbacks = callbacks.render.get(layer);
  if (layerCallbacks == null) {
    layerCallbacks = new Set();
    callbacks.render.set(layer, layerCallbacks);
  }

  return registerCallbackHelper(callback, layerCallbacks);
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

  LAYERS.forEach((layer) => {
    currentLayer = layer;

    const drawCallbacks = callbacks.render.get(layer);
    if (drawCallbacks) {
      drawCallbacks.forEach((callback) => callback(schedulerData, canvas));
    }
  });

  currentLayer = null;
}

export function callResizeHandlers(canvas: Canvas) {
  callbacks.resize.forEach((callback) => callback(canvas));
}
