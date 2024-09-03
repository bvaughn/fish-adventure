import { timestamp } from "../../../scheduling/scheduler";
import { Sprite } from "../Sprites";

export type AnimatedSpriteHelper = {
  getFrame(): Sprite;
  getFrameIndex(): number;
};

export function createAnimatedSpriteHelper({
  frames,
  framesPerSecond = 1,
  loop = true,
}: {
  frames: Sprite[];
  framesPerSecond?: number;
  loop?: boolean;
}): AnimatedSpriteHelper {
  const frameCount = frames.length;
  const thresholdMs = Math.floor(1_000 / framesPerSecond);

  let prevFrameIndex = 0;
  let prevFrameUpdatedAtTime = timestamp;

  function getFrameIndex() {
    const elapsedMs = timestamp - prevFrameUpdatedAtTime;

    let frameIndex =
      elapsedMs >= thresholdMs ? prevFrameIndex + 1 : prevFrameIndex;

    if (frameIndex >= frameCount) {
      if (loop) {
        frameIndex = 0;
      }
    }

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
