import { api, frameRate } from "../p5";

export function frameRateToIndex({
  frameCount,
  framesPerSecond,
  prevFrameIndex,
}: {
  frameCount: number;
  framesPerSecond: number;
  prevFrameIndex: number;
}) {
  const mod = Math.floor(frameRate / framesPerSecond);

  if (api.frameCount % mod === 0) {
    return (prevFrameIndex + 1) % frameCount;
  }

  return prevFrameIndex;
}
