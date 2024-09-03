import { PIXEL_SCALE } from "../constants";
import {
  FOREGROUND_LAYER,
  PLAYER_LAYER_OVERLAY,
  registerDraw,
  registerPreload,
  registerSetup,
} from "../drawing";
import { fromHex } from "../utils/drawing/Color";
import {
  AnimatedSpriteHelper,
  createAnimatedSpriteHelper,
} from "../utils/drawing/spritesheets/createAnimatedSpriteHelper";
import { createSpritesFromGrid } from "../utils/drawing/spritesheets/createSpritesFromGrid";
import { GridSpriteSheet } from "../utils/drawing/spritesheets/types";
import { generateHillData } from "../utils/generateHillData";
import { random } from "../utils/random";
import { addBubble } from "./bubble";

// TODO Scrollable map width (lazily generated?)
// Density of seaweed should be per-pixel

const TEXTURE_HEIGHT = 5;

export function initForeground() {
  let animatedSprites: AnimatedSpriteHelper[];
  let spritePositions: number[] = [];
  let spriteSheets: GridSpriteSheet[];
  let textureValues: number[] = [];

  registerPreload(async () => {
    spriteSheets = [
      createSpritesFromGrid("/images/sprites/seaweed-big.gif", {
        width: 16,
        height: 31,
      }),
      createSpritesFromGrid("/images/sprites/seaweed-small.gif", {
        width: 13,
        height: 22,
      }),
    ];
  });

  registerSetup(() => {
    textureValues = generateHillData({
      hillSectionPixelSize: 5,
      splineNoise: 5,

      width: window.outerWidth,
    });

    animatedSprites = [];

    spriteSheets.forEach((spriteSheet) => {
      for (
        let columnIndex = 0;
        columnIndex < spriteSheet.columnCount;
        columnIndex++
      ) {
        animatedSprites.push(
          createAnimatedSpriteHelper({
            frames: [
              spriteSheet.getSpriteInCell(columnIndex, 0),
              spriteSheet.getSpriteInCell(columnIndex, 1),
            ],
            framesPerSecond: 2,
          })
        );
        spritePositions.push(Math.random());
      }
    });
  });

  registerDraw((data, canvas) => {
    // Draw small foreground hills
    canvas.fill(fromHex("#000d13"));

    animatedSprites.forEach((animated, index) => {
      const sprite = animated.getFrame();
      const x = spritePositions[index] * canvas.width;
      const y = canvas.height - sprite.height;

      canvas.drawSprite(sprite, x, y);
    });

    textureValues.forEach((value, index) => {
      const x = index * PIXEL_SCALE;
      const y = canvas.height - value * TEXTURE_HEIGHT * PIXEL_SCALE;

      canvas.rect(x, y, PIXEL_SCALE, canvas.height - y);
    });

    // Simulate big bubbles coming up from random spots on the ocean floor
    if (data.frameNumber % 100 === 0) {
      const numBubbles = Math.round(random(2, 8));
      const x = Math.round(random(0, canvas.width));
      const y = canvas.height - random(0, 10);
      for (let i = 0; i < numBubbles; i++) {
        addBubble({
          layer: PLAYER_LAYER_OVERLAY,
          partialPosition: { x: x + random(-5, 5), y: y + random(-5, 5) },
          partialVelocity: {
            y: random(-0.5, -0.25),
          },
          size: "bigger",
        });
      }
    }
  }, FOREGROUND_LAYER);
}
