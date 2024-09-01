import * as P5 from "p5";
import {
  BACKGROUND_LAYER_1,
  registerDraw,
  registerPreload,
  registerSetup,
  size,
} from "../p5";
import { generateHillData } from "../utils/generateHillData";
import {
  createIrregular2DSpriteSheet,
  Irregular2DSpriteSheet,
} from "../utils/p5/createIrregular2DSpriteSheet";
import { drawScaledImage } from "../utils/p5/drawScaledImage";
import { createSpriteSheet, SpriteSheet } from "../utils/p5/createSpriteSheet";

const BG_SPRITE_SIZES = [14, 39, 45, 29, 47];
// const BACKGROUND_HILL_1_HEIGHT_LIMIT = 60;
const BACKGROUND_HILL_2_HEIGHT_LIMIT = 15;

let bgHillImage: P5.Image;
let bgHillSprites: Array<{ index: number; x: number }> = [];
let bgHillSpriteSheet: SpriteSheet;
let bgImage: P5.Image;
let bgSpriteSheet: Irregular2DSpriteSheet;
let bgSprites: Array<{ index: number; x: number }> = [];
let bgHill1: number[] = [];
let bgHill2: number[] = [];

registerPreload((api) => {
  bgHillImage = api.loadImage("/images/sprites/background-layer-1.gif");
  bgImage = api.loadImage("/images/sprites/background-layer-2.gif");
});

registerSetup((api) => {
  bgHillSpriteSheet = createSpriteSheet({
    image: bgHillImage,
    spriteSize: {
      width: 160,
      height: 50,
    },
  });
  bgSpriteSheet = createIrregular2DSpriteSheet({
    image: bgImage,
    spriteWidths: BG_SPRITE_SIZES,
  });

  bgHill2 = generateHillData({
    hillSectionPixelSize: 10,
    splineNoise: 2,
  });

  // TODO Position/update items based on movement/scrolling
  // This will require lazily generating positioned items as the window "moves"
  // and then remembering them (if we allow scrolling back)

  for (let index = 0; index < bgHillSpriteSheet.columnCount; index++) {
    bgHillSprites.push({
      index,
      x: api.random(0, size.width - bgHillSpriteSheet.spriteSize.width),
    });
  }
  for (let index = 0; index < BG_SPRITE_SIZES.length; index++) {
    bgSprites.push({
      index,
      x: api.random(0, size.width - BG_SPRITE_SIZES[index]),
    });
  }
});

export function initBackground() {
  registerDraw(function drawBackground(api) {
    api.noStroke();

    // Draw background to foreground (for layering)

    api.fill("#008ca7");
    api.rect(0, 0, size.width, size.height);

    bgHillSprites.forEach(({ index, x }) => {
      drawScaledImage({
        api,
        image: bgHillSpriteSheet.getFrame(index, 0),
        scale: size.pixelScale,
        translateX: x,
        translateY: size.height - bgHillImage.height * size.pixelScale,
      });
    });

    api.fill("#016186");
    bgHill2.forEach((value, index) => {
      const x = index * size.pixelScale;
      const y =
        size.height - value * BACKGROUND_HILL_2_HEIGHT_LIMIT * size.pixelScale;

      api.rect(x, y, size.pixelScale, size.height - y);
    });

    bgSprites.forEach(({ index, x }) => {
      drawScaledImage({
        api,
        image: bgSpriteSheet.getSprite(index),
        scale: size.pixelScale,
        translateX: x,
        translateY: size.height - bgImage.height * size.pixelScale,
      });
    });
  }, BACKGROUND_LAYER_1);
}
