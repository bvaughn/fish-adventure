type PreloadCallback = () => void | Promise<void>;
type SetupCallback = () => void;

const callbacks = {
  preload: [] as Array<PreloadCallback>,
  setup: [] as Array<SetupCallback>,
};

let didRunPreloadWork = false;
let didRunSetupWork = false;

export function schedulePreloadWork(callback: PreloadCallback) {
  if (didRunPreloadWork) {
    throw new Error("Cannot schedule preload work after it has already run");
  }

  return registerCallbackHelper(callback, callbacks.preload);
}

export async function runPreloadWork() {
  if (didRunPreloadWork) {
    throw new Error("Preload work has already run");
  }

  for (const callback of callbacks.preload) {
    await callback();
  }

  // Set after all work has run
  // This allows work to schedule additional work
  didRunPreloadWork = true;
}

export function runSetupWork() {
  if (didRunSetupWork) {
    return;
  }

  for (const callback of callbacks.setup) {
    callback();
  }

  // Set after all work has run
  // This allows work to schedule additional work
  didRunSetupWork = true;
}

// TODO We might be able to remove this phase entirely, now that we have pre-render work and lazy-initialization based on the current screen
export function scheduleSetupWork(callback: SetupCallback) {
  if (didRunSetupWork) {
    callback();

    return noop;
  } else {
    return registerCallbackHelper(callback, callbacks.setup);
  }
}

function noop() {}

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
  callbacks.preload = [];
  callbacks.setup = [];
}
