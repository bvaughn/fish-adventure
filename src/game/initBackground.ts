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

const BG_SPRITE_SIZES = [14, 39, 45, 29, 47];
const BACKGROUND_HILL_1_HEIGHT_LIMIT = 50;
const BACKGROUND_HILL_2_HEIGHT_LIMIT = 25;

let bgImage: P5.Image;
let bgSpriteSheet: Irregular2DSpriteSheet;
let bgHill1: number[] = [];
let bgHill2: number[] = [];

const bgSprites: Array<{ index: number; x: number }> = [];

registerPreload((api) => {
  bgImage = api.loadImage("/images/sprites/background-layer-2.gif");
});

registerSetup((api) => {
  bgSpriteSheet = createIrregular2DSpriteSheet({
    image: bgImage,
    spriteWidths: BG_SPRITE_SIZES,
  });

  bgHill1 = generateHillData({
    hillSectionPixelSize: 10,
    splineNoise: 3,
  });
  bgHill2 = generateHillData({
    hillSectionPixelSize: 5,
    splineNoise: 2,
  });

  // TODO Position/update items based on movement/scrolling
  // This will require lazily generating positioned items as the window "moves"
  // and then remembering them (if we allow scrolling back)

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
    api.fill("#008ca7");
    api.rect(0, 0, size.width, size.height);

    // Draw background to foreground (for layering)

    api.fill("#077399");
    bgHill1.forEach((value, index) => {
      const x = index * size.pixelScale;
      const height =
        BACKGROUND_HILL_1_HEIGHT_LIMIT +
        value * BACKGROUND_HILL_1_HEIGHT_LIMIT * size.pixelScale;
      const y = size.height - height;

      api.rect(x, y, size.pixelScale, size.height - y);
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
