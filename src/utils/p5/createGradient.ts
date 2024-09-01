import { Color } from "../Color";
import { DrawingCanvas } from "../drawing/Canvas";

export function createGradient({
  api,
  blockSize = 1,
  direction,
  fromColor,
  height,
  toColor,
  width,
  x,
  y,
}: {
  api: DrawingCanvas;
  blockSize?: number;
  direction: "down" | "left" | "right" | "up";
  fromColor: Color;
  height: number;
  toColor: Color;
  width: number;
  x: number;
  y: number;
}) {
  const isHorizontal = direction === "left" || direction === "right";
  const isForward = direction === "right" || direction === "down";

  const size = isHorizontal ? width : height;
  const startIndex = isForward ? (isHorizontal ? x : y) : size;
  const stopIndex = isForward ? startIndex + size : startIndex - size;
  const increment = isForward ? 1 : -1;

  const steps = Math.floor(size / blockSize);

  for (
    let index = startIndex;
    isForward ? index < stopIndex : index > stopIndex;
    index += increment
  ) {
    let stepIndex = Math.floor((index / stopIndex) * steps);
    stepIndex = Math.max(0, Math.min(steps, stepIndex));

    const color = api.lerpColor(
      isForward ? fromColor : toColor,
      isForward ? toColor : fromColor,
      stepIndex / steps
    );

    api.stroke(color);
    if (isHorizontal) {
      api.line(index, y, index, height);
    } else {
      api.line(x, index, width, index);
    }
  }
}
