import { FRAME_RATE } from "../../constants";
import { frameNumber } from "../../scheduler";

export function frameRateToIndex({
  frameCount,
  framesPerSecond,
  prevFrameIndex,
}: {
  frameCount: number;
  framesPerSecond: number;
  prevFrameIndex: number;
}) {
  const mod = Math.floor(FRAME_RATE / framesPerSecond);

  if (frameNumber % mod === 0) {
    return (prevFrameIndex + 1) % frameCount;
  }

  return prevFrameIndex;
}
