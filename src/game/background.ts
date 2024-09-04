import { TILE_SIZE } from "../constants";
import { schedulePreloadWork } from "../scheduling/initialization";
import {
  BACKGROUND_LAYER_1,
  BACKGROUND_LAYER_2,
  BACKGROUND_LAYER_3,
  scheduleRenderWork,
} from "../scheduling/rendering";
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
import { addBubble } from "./bubble";
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
  let tilesBG1: TileBG1[] = [];
  let tilesBG2: TileBG2[] = [];
  let tilesBG3: TileBG3[] = [];

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

  function getTileBG1(index: number): TileBG1 {
    while (index > tilesBG1.length - 1) {
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

      tilesBG1.push({
        hillSpriteIndices,
        hillPositions,
      });
    }

    return tilesBG1[index];
  }

  function getTileBG2(index: number): TileBG2 {
    while (index > tilesBG2.length - 1) {
      const countToRender = Math.ceil(TILE_SIZE / 250) * FEATURES_PER_250_PX;

      const featurePositions: number[] = [];

      for (let x = 0; x < countToRender; x++) {
        featurePositions.push(Math.random());
      }

      tilesBG2.push({ featurePositions });
    }

    return tilesBG2[index];
  }

  function getTileBG3(index: number): TileBG3 {
    while (index > tilesBG3.length - 1) {
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

      tilesBG3.push({ animatedSpritesSmall, spritePositionsSmall });
    }

    return tilesBG3[index];
  }

  scheduleRenderWork((data, canvas) => {
    const visibleTiles = getVisibleTilesForLayer(BACKGROUND_LAYER_1);
    visibleTiles.rects.forEach((rect, index) => {
      const { hillPositions, hillSpriteIndices } = getTileBG1(index);

      // Fill in the visual space beneath the hills with solid color
      canvas.fill(fromHex("#077399"));
      canvas.rect(
        rect.x,
        rect.height - HILL_MIN_HEIGHT,
        rect.width,
        HILL_MIN_HEIGHT
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
    visibleTiles.rects.forEach((rect, index) => {
      const { featurePositions } = getTileBG2(index);

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
    visibleTiles.rects.forEach((rect, index) => {
      const { animatedSpritesSmall, spritePositionsSmall } = getTileBG3(index);

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

      const numBubbles = Math.round(random(2, 8));
      const x = Math.round(random(xStart, xStop));
      const y = canvas.height - random(0, 10);
      for (let i = 0; i < numBubbles; i++) {
        addBubble({
          layer: BACKGROUND_LAYER_3,
          partialPosition: {
            x: x + random(-5, 5),
            y: y + random(-5, 5),
          },
          partialVelocity: {
            y: random(-0.5, -0.25),
          },
          size: "bigger",
        });
      }
    }
  }, BACKGROUND_LAYER_3);
}
