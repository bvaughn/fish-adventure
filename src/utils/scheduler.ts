import raf from "raf";

export type Callback = (timestamp: number) => void;
export type CancelScheduled = () => void;

export function schedule(
  callback: Callback,
  minTime?: number
): CancelScheduled {
  let id: number | null = null;
  if (minTime) {
    id = setTimeout(() => callback(performance.now()), minTime);
  } else {
    id = raf(callback);
    // id = setTimeout(() => callback(Date.now()), 0);
  }

  return function cancel() {
    if (minTime) {
      clearTimeout(id);
    } else {
      raf.cancel(id);
      // clearTimeout(id);
    }
  };
}
