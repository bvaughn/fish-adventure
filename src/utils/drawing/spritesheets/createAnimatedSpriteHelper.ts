import { timestamp } from "../../../scheduler";
import { Sprite } from "../Sprites";

export type AnimatedSpriteHelper = {
  getFrame(): Sprite;
  getFrameIndex(): number;
};

export function createAnimatedSpriteHelper({
  frames,
  framesPerSecond = 1,
}: {
  frames: Sprite[];
  framesPerSecond?: number;
}): AnimatedSpriteHelper {
  const frameCount = frames.length;
  const thresholdMs = Math.floor(1_000 / framesPerSecond);

  let prevFrameIndex = 0;
  let prevFrameUpdatedAtTime = timestamp;

  function getFrameIndex() {
    const elapsedMs = timestamp - prevFrameUpdatedAtTime;

    const frameIndex =
      elapsedMs >= thresholdMs
        ? (prevFrameIndex + 1) % frameCount
        : prevFrameIndex % frameCount;

    if (prevFrameIndex !== frameIndex) {
      prevFrameIndex = frameIndex;
      prevFrameUpdatedAtTime = timestamp;
    }

    return frameIndex;
  }

  function getFrame() {
    const frameIndex = getFrameIndex();

    return frames[frameIndex];
  }

  return { getFrame, getFrameIndex };
}
