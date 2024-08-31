import * as P5 from "p5";
import { frameRateToIndex } from "../frameRateToIndex";
import { drawScaledImage } from "./drawScaledImage";

export function createAnimation({
  frames,
  framesPerSecond = 1,
  location,
}: {
  frames: P5.Image[];
  framesPerSecond?: number;
  location: P5.Vector;
}) {
  let frameIndex = 0;

  function draw() {
    frameIndex = frameRateToIndex({
      frameCount: frames.length,
      framesPerSecond,
      prevFrameIndex: frameIndex,
    });

    const frame = frames[frameIndex];

    drawScaledImage({
      image: frame,
      translateX: location.x,
      translateY: location.y,
    });
  }

  return {
    draw,
    location,
  };
}
