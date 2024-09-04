import { MAX_OFFSET_X } from "../constants";
import { canvas } from "../main";
import {
  BACKGROUND_LAYER_1,
  BACKGROUND_LAYER_2,
  BACKGROUND_LAYER_3,
  scheduleRenderWork,
} from "../scheduling/drawing";
import {
  schedulePreloadWork,
  scheduleSetupWork,
} from "../scheduling/initialization";
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
import { addBubble } from "./bubble";

const HILL_MIN_HEIGHT = 25;
const SPACING = 50;

// TODO Pre-generate the first few "screens" of data
// then lazily generate (and cache) data for the rest

export function initBackground() {
  let animatedSpritesSmall: AnimatedSpriteHelper[];
  let featureSpriteSheet: FlatSpriteSheet;
  let featurePositions: number[];
  let featureSpacing = 0;
  let hillSpriteIndices: number[];
  let hillSpriteSheet: GridSpriteSheet;
  let spritePositionsSmall: number[] = [];
  let spriteSheetSmall: GridSpriteSheet;

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

  function initializeScreen(screen: Rect) {
    // TODO
  }

  scheduleSetupWork(() => {
    animatedSpritesSmall = [];
    hillSpriteIndices = [];

    for (let x = 0; x < MAX_OFFSET_X; x += SPACING) {
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

    for (let x = 0; x < MAX_OFFSET_X; x += hillSpriteSheet.spriteSize.width) {
      hillSpriteIndices.push(
        Math.floor(Math.random() * hillSpriteSheet.sprites.length)
      );
    }

    featureSpacing = canvas.width / featureSpriteSheet.sprites.length;
    featurePositions = [];

    for (let x = 0; x < MAX_OFFSET_X; x += featureSpacing) {
      featurePositions.push(Math.random());
    }
  });

  scheduleRenderWork((data, canvas) => {
    canvas.fill(fromHex("#008ca7"));
    canvas.rect(0, 0, canvas.width * 5 /*TODO*/, canvas.height);

    canvas.fill(fromHex("#077399"));
    canvas.rect(
      0,
      canvas.height - HILL_MIN_HEIGHT,
      canvas.width * 5, // TODO
      HILL_MIN_HEIGHT
    );

    hillSpriteIndices.forEach((spriteIndex, index) => {
      const sprite = hillSpriteSheet.sprites[spriteIndex];
      const x = index * 320;
      const y = canvas.height - 52 - HILL_MIN_HEIGHT;

      canvas.drawSprite(sprite, x, y);
    });
  }, BACKGROUND_LAYER_1);

  scheduleRenderWork((data, canvas) => {
    featurePositions.forEach((position, index) => {
      const sprite =
        featureSpriteSheet.sprites[index % featureSpriteSheet.sprites.length];

      const x = index * featureSpacing + position * featureSpacing;
      const y = canvas.height - sprite.height;

      canvas.drawSprite(sprite, x, y);
    });
  }, BACKGROUND_LAYER_2);

  scheduleRenderWork((data, canvas) => {
    for (let index = 0; index < spritePositionsSmall.length; index++) {
      const animated =
        animatedSpritesSmall[index % animatedSpritesSmall.length];
      const sprite = animated.getFrame();

      const position = spritePositionsSmall[index];
      const x = index * SPACING + position * canvas.width;
      const y = canvas.height - sprite.height;

      canvas.drawSprite(sprite, x, y);
    }

    // Simulate big bubbles coming up from random spots on the ocean floor
    // TODO Spawn bubbles within the visible screen region
    if (data.frameNumber % 100 === 0) {
      const numBubbles = Math.round(random(2, 8));
      const x = Math.round(random(0, canvas.width));
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
