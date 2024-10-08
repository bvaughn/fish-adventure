import { TILE_SIZE } from "../constants";
import { schedulePreloadWork } from "../scheduling/initialization";
import { Layer, scheduleRenderWork } from "../scheduling/rendering";
import { Rect } from "../types";
import {
  AnimatedSpriteHelper,
  createAnimatedSpriteHelper,
} from "../utils/drawing/spritesheets/createAnimatedSpriteHelper";
import { createSpritesFromGrid } from "../utils/drawing/spritesheets/createSpritesFromGrid";
import { GridSpriteSheet } from "../utils/drawing/spritesheets/types";
import { getVisibleTilesForLayer } from "./sharedState";

type Tile = {
  animatedSeaweedSprites: AnimatedSpriteHelper[];
  seaweedPositions: number[];
  textureIndices: number[];
};

const SEAWEED_BOTTOM_MARGIN = 4;
const SEAWEED_PER_250_PX = 2;

export function initForeground() {
  let seaweedSpriteSheet: GridSpriteSheet;
  let textureSpriteSheet: GridSpriteSheet;
  let tiles: Map<number, Tile> = new Map();

  schedulePreloadWork(async () => {
    seaweedSpriteSheet = createSpritesFromGrid(
      "/images/sprites/seaweed-big.gif",
      {
        width: 16,
        height: 31,
      }
    );
    textureSpriteSheet = createSpritesFromGrid(
      "/images/sprites/foreground-texture.gif",
      {
        width: 100,
        height: 8,
      }
    );
  });

  function getTile(rect: Rect): Tile {
    let tile = tiles.get(rect.x);
    if (!tile) {
      const animatedSeaweedSprites: AnimatedSpriteHelper[] = [];
      const seaweedPositions: number[] = [];
      const textureIndices: number[] = [];

      const seaweedToRender = Math.ceil(TILE_SIZE / 250) * SEAWEED_PER_250_PX;
      for (let x = 0; x < seaweedToRender; x++) {
        animatedSeaweedSprites.push(
          createAnimatedSpriteHelper({
            frames: [
              seaweedSpriteSheet.getSpriteInCell(
                x % seaweedSpriteSheet.columnCount,
                0
              ),
              seaweedSpriteSheet.getSpriteInCell(
                x % seaweedSpriteSheet.columnCount,
                1
              ),
            ],
            framesPerSecond: 2,
          })
        );
        seaweedPositions.push(Math.random());
      }

      const texturesToRender = Math.ceil(
        TILE_SIZE / textureSpriteSheet.spriteSize.width
      );
      for (let x = 0; x < texturesToRender; x++) {
        textureIndices.push(
          Math.floor(Math.random() * textureSpriteSheet.columnCount)
        );
      }

      tile = { animatedSeaweedSprites, seaweedPositions, textureIndices };

      tiles.set(rect.x, tile);
    }

    return tile;
  }

  scheduleRenderWork((data, canvas) => {
    const visibleTiles = getVisibleTilesForLayer(Layer.FOREGROUND_LAYER);
    visibleTiles.rects.forEach((rect) => {
      const { animatedSeaweedSprites, seaweedPositions, textureIndices } =
        getTile(rect);

      for (let index = 0; index < seaweedPositions.length; index++) {
        const animated =
          animatedSeaweedSprites[index % animatedSeaweedSprites.length];
        const sprite = animated.getFrame();

        const position = seaweedPositions[index];
        const x = rect.x + position * rect.width;
        const y = canvas.height - sprite.height - SEAWEED_BOTTOM_MARGIN;

        canvas.drawSprite(sprite, x, y);
      }

      textureIndices.forEach((textureIndex, index) => {
        const sprite = textureSpriteSheet.getSpriteInCell(textureIndex, 0);

        const x = rect.x + index * sprite.width;
        const y = canvas.height - sprite.height;

        canvas.drawSprite(sprite, x, y);
      });
    });
  }, Layer.FOREGROUND_LAYER);
}
