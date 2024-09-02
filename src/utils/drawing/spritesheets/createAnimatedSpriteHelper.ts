import { frameRateToIndex } from "../frameRateToIndex";
import { Sprite } from "../Sprites";

export type AnimatedSpriteHelper = {
  getFrame(): Sprite;
};

export function createAnimatedSpriteHelper({
  frames,
  framesPerSecond = 1,
}: {
  frames: Sprite[];
  framesPerSecond?: number;
}): AnimatedSpriteHelper {
  let frameIndex = 0;

  function getFrame() {
    frameIndex = frameRateToIndex({
      frameCount: frames.length,
      framesPerSecond,
      prevFrameIndex: frameIndex,
    });

    return frames[frameIndex];
  }

  return { getFrame };
}
