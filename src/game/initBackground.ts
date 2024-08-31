import * as P5 from "p5";
import {
  BACKGROUND_LAYER_1,
  registerDraw,
  registerPreload,
  registerSetup,
  size,
} from "../p5";
import {
  createIrregular2DSpriteSheet,
  Irregular2DSpriteSheet,
} from "../utils/p5/createIrregular2DSpriteSheet";
import { drawScaledImage } from "../utils/p5/drawScaledImage";

const BACKGROUND_LAYER_1_SIZES = [160, 160, 160, 160];
const BACKGROUND_LAYER_2 = [121, 26, 44];

let bgLayer1Image: P5.Image;
let bgLayer1SpriteSheet: Irregular2DSpriteSheet;
let bgLayer2Image: P5.Image;
let bgLayer2SpriteSheet: Irregular2DSpriteSheet;

const bgLayer1Sprites: Array<{ index: number; x: number }> = [];
const bgLayer2Sprites: Array<{ index: number; x: number }> = [];

registerPreload((api) => {
  bgLayer1Image = api.loadImage("/images/sprites/background-layer-1.gif");
  bgLayer2Image = api.loadImage("/images/sprites/background-layer-2.gif");
});

registerSetup((api) => {
  bgLayer1SpriteSheet = createIrregular2DSpriteSheet({
    image: bgLayer1Image,
    spriteWidths: BACKGROUND_LAYER_1_SIZES,
  });
  bgLayer2SpriteSheet = createIrregular2DSpriteSheet({
    image: bgLayer2Image,
    spriteWidths: BACKGROUND_LAYER_2,
  });

  // TODO Position/update items based on movement/scrolling
  // This will require lazily generating positioned items as the window "moves"
  // and then remembering them (if we allow scrolling back)

  for (let index = 0; index < BACKGROUND_LAYER_1_SIZES.length * 3; index++) {
    bgLayer1Sprites.push({
      index: index % BACKGROUND_LAYER_1_SIZES.length,
      x: api.random(
        0,
        size.width -
          BACKGROUND_LAYER_1_SIZES[index % BACKGROUND_LAYER_1_SIZES.length]
      ),
    });
  }
  for (let index = 0; index < BACKGROUND_LAYER_2.length; index++) {
    bgLayer2Sprites.push({
      index,
      x: api.random(0, size.width - BACKGROUND_LAYER_2[index]),
    });
  }
});

export function initBackground() {
  registerDraw(function drawBackground(api) {
    api.fill("#008ca7");
    api.rect(0, 0, size.width, size.height);

    // Draw background to foreground (for layering)

    bgLayer1Sprites.forEach(({ index, x }) => {
      drawScaledImage({
        api,
        image: bgLayer1SpriteSheet.getSprite(index),
        scale: size.pixelScale,
        translateX: x,
        translateY: size.height - bgLayer1Image.height * size.pixelScale,
      });
    });

    bgLayer2Sprites.forEach(({ index, x }) => {
      drawScaledImage({
        api,
        image: bgLayer2SpriteSheet.getSprite(index),
        scale: size.pixelScale,
        translateX: x,
        translateY: size.height - bgLayer2Image.height * size.pixelScale,
      });
    });
  }, BACKGROUND_LAYER_1);
}
