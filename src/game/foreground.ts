import { MAX_OFFSET_X, PIXEL_SCALE } from "../constants";
import { FOREGROUND_LAYER, scheduleRenderWork } from "../scheduling/drawing";
import {
  schedulePreloadWork,
  scheduleSetupWork,
} from "../scheduling/initialization";
import { fromHex } from "../utils/drawing/Color";
import {
  AnimatedSpriteHelper,
  createAnimatedSpriteHelper,
} from "../utils/drawing/spritesheets/createAnimatedSpriteHelper";
import { createSpritesFromGrid } from "../utils/drawing/spritesheets/createSpritesFromGrid";
import { GridSpriteSheet } from "../utils/drawing/spritesheets/types";
import { generateHillData } from "../utils/generateHillData";

// TODO Pre-generate the first few "screens" of data
// then lazily generate (and cache) data for the rest

// TODO Density of seaweed should be per-pixel

const SPACING = 50;
const TEXTURE_HEIGHT = 5;

export function initForeground() {
  let animatedSpritesBig: AnimatedSpriteHelper[];
  let spritePositionsBig: number[] = [];
  let spriteSheetBig: GridSpriteSheet;
  let textureValues: number[] = [];

  schedulePreloadWork(async () => {
    spriteSheetBig = createSpritesFromGrid("/images/sprites/seaweed-big.gif", {
      width: 16,
      height: 31,
    });
  });

  scheduleSetupWork(() => {
    textureValues = generateHillData({
      hillSectionPixelSize: 5,
      splineNoise: 5,

      width: MAX_OFFSET_X,
    });

    animatedSpritesBig = [];

    for (let x = 0; x < MAX_OFFSET_X; x += SPACING) {
      animatedSpritesBig.push(
        createAnimatedSpriteHelper({
          frames: [
            spriteSheetBig.getSpriteInCell(x % spriteSheetBig.columnCount, 0),
            spriteSheetBig.getSpriteInCell(x % spriteSheetBig.columnCount, 1),
          ],
          framesPerSecond: 2,
        })
      );
      spritePositionsBig.push(Math.random());
    }
  });

  scheduleRenderWork((data, canvas) => {
    canvas.fill(fromHex("#000d13"));

    for (let index = 0; index < spritePositionsBig.length; index++) {
      const animated = animatedSpritesBig[index % animatedSpritesBig.length];
      const sprite = animated.getFrame();

      const position = spritePositionsBig[index];
      const x = index * SPACING + position * canvas.width;
      const y = canvas.height - sprite.height;

      canvas.drawSprite(sprite, x, y);
    }

    textureValues.forEach((value, index) => {
      const x = index * PIXEL_SCALE;
      const y = canvas.height - value * TEXTURE_HEIGHT * PIXEL_SCALE;

      canvas.rect(x, y, PIXEL_SCALE, canvas.height - y);
    });
  }, FOREGROUND_LAYER);
}
