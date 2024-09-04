import { SchedulerData } from "./scheduler";

type Callback = (schedulerData: SchedulerData) => void;

const callbacks = {
  npc: [] as Array<Callback>,
  player: [] as Array<Callback>,
};

export function runNPCPreRenderCallbacks(schedulerData: SchedulerData) {
  callbacks.npc.forEach((callback) => callback(schedulerData));
}

export function runPlayerPreRenderCallbacks(schedulerData: SchedulerData) {
  callbacks.player.forEach((callback) => callback(schedulerData));
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

export function scheduleNPCPreRenderUpdate(callback: Callback) {
  return registerCallbackHelper(callback, callbacks.npc);
}

export function schedulePlayerPreRenderUpdate(callback: Callback) {
  return registerCallbackHelper(callback, callbacks.player);
}
export function unregisterAll() {
  callbacks.npc = [];
  callbacks.player = [];
}
