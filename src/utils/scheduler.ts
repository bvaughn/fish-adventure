import raf from "raf";

export type Callback = (timestamp: number) => void;
export type CancelScheduled = () => void;

export function schedule(
  callback: Callback,
  minTime?: number
): CancelScheduled {
  let id: any = null;
  if (minTime) {
    id = setTimeout(() => callback(performance.now()), minTime);
  } else {
    id = raf(callback);
  }

  return function cancel() {
    if (minTime) {
      clearTimeout(id);
    } else {
      raf.cancel(id);
    }
  };
}
