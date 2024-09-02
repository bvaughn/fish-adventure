import { frameRateToIndex } from "../frameRateToIndex";
import { Sprite } from "../Sprites";

export type FiniteAnimatedSpriteHelper = {
  getFrame(): Sprite | null;
};

export function createFiniteAnimatedSpriteHelper({
  frames,
  framesPerSecond = 1,
}: {
  frames: Sprite[];
  framesPerSecond?: number;
}): FiniteAnimatedSpriteHelper {
  let frameIndex = 0;

  function getFrame() {
    frameIndex = frameRateToIndex({
      frameCount: frames.length + 1,
      framesPerSecond,
      prevFrameIndex: frameIndex,
    });

    return frames[frameIndex] ?? null;
  }

  return { getFrame };
}
