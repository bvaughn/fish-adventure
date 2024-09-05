import { TILE_SIZE } from "../constants";
import { schedulePreloadWork } from "../scheduling/initialization";
import {
  BACKGROUND_LAYER_1,
  BACKGROUND_LAYER_2,
  BACKGROUND_LAYER_3,
  scheduleRenderWork,
} from "../scheduling/rendering";
import { Rect } from "../types";
import { fromHex } from "../utils/drawing/Color";
import {
  AnimatedSpriteHelper,
  createAnimatedSpriteHelper,
} from "../utils/drawing/spritesheets/createAnimatedSpriteHelper";
import { createSpritesFromGrid } from "../utils/drawing/spritesheets/createSpritesFromGrid";
import { createSpritesFromSizes } from "../utils/drawing/spritesheets/createSpritesFromSizes";
import {
  FlatSpriteSheet,
  GridSpriteSheet,
} from "../utils/drawing/spritesheets/types";
import { random } from "../utils/random";
import { addBubbles } from "./bubble";
import { getVisibleTilesForLayer } from "./sharedState";

const FEATURES_PER_250_PX = 2;
const HILL_MIN_HEIGHT = 25;
const SEAWEED_PER_250_PX = 2;

type TileBG1 = {
  hillSpriteIndices: number[];
  hillPositions: number[];
};

type TileBG2 = {
  featurePositions: number[];
};

type TileBG3 = {
  animatedSpritesSmall: AnimatedSpriteHelper[];
  spritePositionsSmall: number[];
};

export function initBackground() {
  let featureSpriteSheet: FlatSpriteSheet;
  let hillSpriteSheet: GridSpriteSheet;
  let spriteSheetSmall: GridSpriteSheet;
  let tilesBG1: Map<number, TileBG1> = new Map();
  let tilesBG2: Map<number, TileBG2> = new Map();
  let tilesBG3: Map<number, TileBG3> = new Map();

  // Preload sprite sheet images
  schedulePreloadWork(async () => {
    hillSpriteSheet = createSpritesFromGrid(
      "/images/sprites/background-hills.gif",
      {
        width: 320,
        height: 52,
      }
    );
    featureSpriteSheet = createSpritesFromSizes(
      "/images/sprites/background-features.gif",
      [14, 39, 45, 28, 49, 40, 36, 37]
    );
    spriteSheetSmall = createSpritesFromGrid(
      "/images/sprites/seaweed-small.gif",
      {
        width: 13,
        height: 22,
      }
    );
  });

  function getTileBG1(rect: Rect): TileBG1 {
    let tile = tilesBG1.get(rect.x);
    if (!tile) {
      const hillWidth = hillSpriteSheet.spriteSize.width;
      const countToRender = Math.ceil(TILE_SIZE / hillWidth);
      const spacing = TILE_SIZE / countToRender;

      const hillPositions: number[] = [];
      const hillSpriteIndices: number[] = [];

      for (let x = 0; x < countToRender; x++) {
        hillSpriteIndices.push(
          Math.floor(Math.random() * hillSpriteSheet.sprites.length)
        );
        hillPositions.push(x * spacing);
      }

      tile = {
        hillSpriteIndices,
        hillPositions,
      };

      tilesBG1.set(rect.x, tile);
    }

    return tile;
  }

  function getTileBG2(rect: Rect): TileBG2 {
    let tile = tilesBG2.get(rect.x);
    if (!tile) {
      const countToRender = Math.ceil(TILE_SIZE / 250) * FEATURES_PER_250_PX;

      const featurePositions: number[] = [];

      for (let x = 0; x < countToRender; x++) {
        featurePositions.push(Math.random());
      }

      tile = { featurePositions };

      tilesBG2.set(rect.x, tile);
    }

    return tile;
  }

  function getTileBG3(rect: Rect): TileBG3 {
    let tile = tilesBG3.get(rect.x);
    if (!tile) {
      const countToRender = Math.ceil(TILE_SIZE / 250) * SEAWEED_PER_250_PX;

      const animatedSpritesSmall: AnimatedSpriteHelper[] = [];
      const spritePositionsSmall: number[] = [];

      for (let x = 0; x < countToRender; x++) {
        animatedSpritesSmall.push(
          createAnimatedSpriteHelper({
            frames: [
              spriteSheetSmall.getSpriteInCell(
                x % spriteSheetSmall.columnCount,
                0
              ),
              spriteSheetSmall.getSpriteInCell(
                x % spriteSheetSmall.columnCount,
                1
              ),
            ],
            framesPerSecond: 2,
          })
        );

        spritePositionsSmall.push(Math.random());
      }

      tile = { animatedSpritesSmall, spritePositionsSmall };

      tilesBG3.set(rect.x, tile);
    }

    return tile;
  }

  scheduleRenderWork((data, canvas) => {
    const visibleTiles = getVisibleTilesForLayer(BACKGROUND_LAYER_1);
    visibleTiles.rects.forEach((rect) => {
      const { hillPositions, hillSpriteIndices } = getTileBG1(rect);

      // Fill in the visual space beneath the hills with solid color
      // Overlap slightly so there's no visible partial line
      canvas.fill(fromHex("#077399"));
      canvas.rect(
        rect.x,
        rect.height - HILL_MIN_HEIGHT - 1,
        rect.width,
        HILL_MIN_HEIGHT + 1
      );

      hillSpriteIndices.forEach((spriteIndex, index) => {
        const sprite = hillSpriteSheet.sprites[spriteIndex];
        const x = rect.x + hillPositions[index];
        const y = canvas.height - 52 - HILL_MIN_HEIGHT;

        canvas.drawSprite(sprite, x, y);
      });
    });
  }, BACKGROUND_LAYER_1);

  scheduleRenderWork((data, canvas) => {
    const visibleTiles = getVisibleTilesForLayer(BACKGROUND_LAYER_2);
    visibleTiles.rects.forEach((rect) => {
      const { featurePositions } = getTileBG2(rect);

      featurePositions.forEach((position, index) => {
        const sprite =
          featureSpriteSheet.sprites[index % featureSpriteSheet.sprites.length];

        const x = rect.x + position * rect.width;
        const y = canvas.height - sprite.height;

        canvas.drawSprite(sprite, x, y);
      });
    });
  }, BACKGROUND_LAYER_2);

  scheduleRenderWork((data, canvas) => {
    const visibleTiles = getVisibleTilesForLayer(BACKGROUND_LAYER_3);
    visibleTiles.rects.forEach((rect) => {
      const { animatedSpritesSmall, spritePositionsSmall } = getTileBG3(rect);

      for (let index = 0; index < spritePositionsSmall.length; index++) {
        const animated = animatedSpritesSmall[index];
        const sprite = animated.getFrame();

        const position = spritePositionsSmall[index];
        const x = rect.x + position * rect.width;
        const y = canvas.height - sprite.height;

        canvas.drawSprite(sprite, x, y);
      }
    });

    // Simulate big bubbles coming up from random spots on the ocean floor
    if (data.frameNumber % 100 === 0) {
      const { xStart, xStop } = visibleTiles;

      addBubbles({
        count: Math.round(random(2, 8)),
        layer: BACKGROUND_LAYER_3,
        position: {
          x: Math.round(random(xStart, xStop)),
          y: canvas.height - random(0, 10),
        },
        partialVelocity: {
          y: random(-0.5, -0.25),
        },
        size: "bigger",
      });
    }
  }, BACKGROUND_LAYER_3);
}
