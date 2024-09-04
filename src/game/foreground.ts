import { PIXEL_SCALE, TILE_SIZE } from "../constants";
import { schedulePreloadWork } from "../scheduling/initialization";
import { FOREGROUND_LAYER, scheduleRenderWork } from "../scheduling/rendering";
import { fromHex } from "../utils/drawing/Color";
import {
  AnimatedSpriteHelper,
  createAnimatedSpriteHelper,
} from "../utils/drawing/spritesheets/createAnimatedSpriteHelper";
import { createSpritesFromGrid } from "../utils/drawing/spritesheets/createSpritesFromGrid";
import { GridSpriteSheet } from "../utils/drawing/spritesheets/types";
import { generateHillData } from "../utils/generateHillData";
import { getVisibleTilesForLayer } from "./sharedState";

type Tile = {
  animatedSpritesBig: AnimatedSpriteHelper[];
  spritePositionsBig: number[];
  textureValues: number[];
};

const SEAWEED_PER_250_PX = 2;
const TEXTURE_HEIGHT = 5;

export function initForeground() {
  let spriteSheetBig: GridSpriteSheet;
  let tiles: Tile[] = [];

  schedulePreloadWork(async () => {
    spriteSheetBig = createSpritesFromGrid("/images/sprites/seaweed-big.gif", {
      width: 16,
      height: 31,
    });
  });

  function getTile(index: number): Tile {
    while (index > tiles.length - 1) {
      const animatedSpritesBig: AnimatedSpriteHelper[] = [];
      const spritePositionsBig: number[] = [];

      // TODO This doesn't work so well; the edges end up being jagged
      // Maybe I should just hand-draw these assets too; wouldn't take long
      const textureValues = generateHillData({
        hillSectionPixelSize: 5,
        splineNoise: 5,
        width: TILE_SIZE,
      });

      const countToRender = Math.ceil(TILE_SIZE / 250) * SEAWEED_PER_250_PX;

      for (let x = 0; x < countToRender; x++) {
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

      tiles.push({ animatedSpritesBig, spritePositionsBig, textureValues });
    }

    return tiles[index];
  }

  scheduleRenderWork((data, canvas) => {
    const visibleTiles = getVisibleTilesForLayer(FOREGROUND_LAYER);
    visibleTiles.rects.forEach((rect, index) => {
      const { animatedSpritesBig, spritePositionsBig, textureValues } =
        getTile(index);

      for (let index = 0; index < spritePositionsBig.length; index++) {
        const animated = animatedSpritesBig[index % animatedSpritesBig.length];
        const sprite = animated.getFrame();

        const position = spritePositionsBig[index];
        const x = rect.x + position * rect.width;
        const y = canvas.height - sprite.height;

        canvas.drawSprite(sprite, x, y);
      }

      canvas.fill(fromHex("#000d13"));

      textureValues.forEach((value, index) => {
        const x = rect.x + index * PIXEL_SCALE;
        const y = canvas.height - value * TEXTURE_HEIGHT * PIXEL_SCALE;

        canvas.rect(x, y, PIXEL_SCALE, canvas.height - y);
      });
    });
  }, FOREGROUND_LAYER);
}
