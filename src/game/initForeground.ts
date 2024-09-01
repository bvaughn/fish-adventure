import * as P5 from "p5";
import {
  FOREGROUND_LAYER,
  registerDraw,
  registerPreload,
  registerResize,
  registerSetup,
  size,
} from "../p5";
import { generateHillData } from "../utils/generateHillData";
import { createAnimation } from "../utils/p5/createAnimation";
import { createSpriteSheet, SpriteSheet } from "../utils/p5/createSpriteSheet";

const MAX_HILL_HEIGHT_PIXELS = 5;

let hillTextures: number[] = [];
let seaweedImage: P5.Image;
let seaweedSpriteSheet: SpriteSheet;

const seaweedAnimations: ReturnType<typeof createAnimation>[] = [];

registerPreload((api) => {
  seaweedImage = api.loadImage("/images/sprites/seaweed.gif");
});

registerSetup((api) => {
  seaweedSpriteSheet = createSpriteSheet({
    image: seaweedImage,
    spriteSize: {
      height: 31,
      width: 16,
    },
  });

  // Small random hills in the foreground
  hillTextures = generateHillData({
    hillSectionPixelSize: 5,
    splineNoise: 2,
  });

  // Animated seaweeds
  for (let index = 0; index < seaweedSpriteSheet.columnCount * 3; index++) {
    const columnIndex = index % seaweedSpriteSheet.columnCount;
    const frames = [
      seaweedSpriteSheet.getFrame(columnIndex, 0),
      seaweedSpriteSheet.getFrame(columnIndex, 1),
    ];

    seaweedAnimations.push(
      createAnimation({
        frames,
        framesPerSecond: api.random(1, 3),
        location: api.createVector(
          api.random(0, size.width - 16),
          size.height - 31 * size.pixelScale
        ),
      })
    );
  }
});

registerResize(() => {
  seaweedAnimations.forEach((animation) => {
    animation.location.y =
      size.height - seaweedSpriteSheet.spriteSize.height * size.pixelScale;
  });
});

export function initForeground() {
  registerDraw(function drawBackground(api) {
    api.noStroke();

    seaweedAnimations.forEach((animation) => {
      animation.draw();
    });

    // Draw small foreground hills
    api.fill("#000d13");
    hillTextures.forEach((value, index) => {
      const x = index * size.pixelScale;
      const y = size.height - value * MAX_HILL_HEIGHT_PIXELS * size.pixelScale;

      api.rect(x, y, size.pixelScale, size.height - y);
    });
  }, FOREGROUND_LAYER);
}
