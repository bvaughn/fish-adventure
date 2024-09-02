import {
  BACKGROUND_LAYER_1,
  registerDraw,
  registerPreload,
  registerSetup,
} from "../drawing";
import { canvas } from "../main";
import { fromHex } from "../utils/drawing/Color";
import { createSpritesFromGrid } from "../utils/drawing/spritesheets/createSpritesFromGrid";
import { createSpritesFromSizes } from "../utils/drawing/spritesheets/createSpritesFromSizes";
import {
  FlatSpriteSheet,
  GridSpriteSheet,
} from "../utils/drawing/spritesheets/types";

const HILL_MIN_HEIGHT = 25;

// TODO Scrollable map width (lazily generated?)

export function initBackground() {
  let featureSpriteSheet: FlatSpriteSheet;
  let featurePositions: number[];
  let hillSpriteIndices: number[];
  let hillSpriteSheet: GridSpriteSheet;

  registerPreload(async () => {
    hillSpriteSheet = createSpritesFromGrid(
      "/images/sprites/background-hills.gif",
      {
        width: 320,
        height: 52,
      }
    );
    featureSpriteSheet = createSpritesFromSizes(
      "/images/sprites/background-features.gif",
      [14, 39, 45, 28, 49]
    );
  });

  registerSetup(() => {
    hillSpriteIndices = [];

    for (let x = 0; x < canvas.width; x += 320) {
      hillSpriteIndices.push(
        Math.floor(Math.random() * hillSpriteSheet.columnCount)
      );
    }

    featurePositions = new Array(5).fill(true).map(() => Math.random());
  });

  registerDraw((data, canvas) => {
    canvas.fill(fromHex("#008ca7"));
    canvas.rect(0, 0, canvas.width, canvas.height);

    canvas.fill(fromHex("#077399"));
    canvas.rect(
      0,
      canvas.height - HILL_MIN_HEIGHT,
      canvas.width,
      HILL_MIN_HEIGHT
    );

    hillSpriteIndices.forEach((spriteIndex, index) => {
      const sprite = hillSpriteSheet.sprites[spriteIndex];
      const x = index * 320;
      const y = canvas.height - 52 - HILL_MIN_HEIGHT;

      canvas.drawSprite(sprite, x, y);
    });

    featureSpriteSheet.sprites.forEach((sprite, index) => {
      const x = featurePositions[index] * canvas.width;
      const y = canvas.height - sprite.height;

      canvas.drawSprite(sprite, x, y);
    });
  }, BACKGROUND_LAYER_1);
}
