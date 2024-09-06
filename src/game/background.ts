import { TILE_SIZE } from "../constants";
import { schedulePreloadWork } from "../scheduling/initialization";
import { Layer, scheduleRenderWork } from "../scheduling/rendering";
import { Rect } from "../types";
import { Canvas } from "../utils/drawing/Canvas";
import { Color, fromHex } from "../utils/drawing/Color";
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
const SEAWEED_BOTTOM_MARGIN = 4;
const SEAWEED_PER_250_PX = 2;

type HillLayers =
  | Layer.BACKGROUND_LAYER_1
  | Layer.BACKGROUND_LAYER_2
  | Layer.BACKGROUND_LAYER_3;

type HillTile = {
  hillColumnIndices: number[];
  hillPositions: number[];
};

type FeatureTile = {
  featurePositions: number[];
};

type SeaweedTile = {
  animatedSpritesSmall: AnimatedSpriteHelper[];
  spritePositionsSmall: number[];
};

export function initBackground() {
  let featureSpriteSheet: FlatSpriteSheet;
  let hillSpriteSheet: GridSpriteSheet;
  let spriteSheetSmall: GridSpriteSheet;
  let tilesBG1: Map<number, HillTile> = new Map();
  let tilesBG2: Map<number, HillTile> = new Map();
  let tilesBG3: Map<number, HillTile> = new Map();
  let tilesBG4: Map<number, FeatureTile> = new Map();
  let tilesBG5: Map<number, SeaweedTile> = new Map();

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

  function getHillTile(rect: Rect, layer: HillLayers): HillTile {
    let tileMap: Map<number, HillTile>;
    switch (layer) {
      case Layer.BACKGROUND_LAYER_1:
        tileMap = tilesBG1;
        break;
      case Layer.BACKGROUND_LAYER_2:
        tileMap = tilesBG2;
        break;
      case Layer.BACKGROUND_LAYER_3:
        tileMap = tilesBG3;
        break;
    }

    let tile = tileMap.get(rect.x);
    if (!tile) {
      const hillWidth = hillSpriteSheet.spriteSize.width;
      const countToRender = Math.ceil(TILE_SIZE / hillWidth);
      const spacing = TILE_SIZE / countToRender;

      const hillPositions: number[] = [];
      const hillColumnIndices: number[] = [];

      for (let x = 0; x < countToRender; x++) {
        hillColumnIndices.push(
          Math.floor(Math.random() * hillSpriteSheet.columnCount)
        );
        hillPositions.push(x * spacing);
      }

      tile = {
        hillColumnIndices,
        hillPositions,
      };

      tileMap.set(rect.x, tile);
    }

    return tile;
  }

  function getFeatureTile(rect: Rect): FeatureTile {
    let tile = tilesBG4.get(rect.x);
    if (!tile) {
      const countToRender = Math.ceil(TILE_SIZE / 250) * FEATURES_PER_250_PX;

      const featurePositions: number[] = [];

      for (let x = 0; x < countToRender; x++) {
        featurePositions.push(Math.random());
      }

      tile = { featurePositions };

      tilesBG4.set(rect.x, tile);
    }

    return tile;
  }

  function getSeaweedTile(rect: Rect): SeaweedTile {
    let tile = tilesBG5.get(rect.x);
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

      tilesBG5.set(rect.x, tile);
    }

    return tile;
  }

  function renderHillsForLayer(layer: HillLayers, canvas: Canvas) {
    let backgroundColor: Color;
    let rowIndex: number;
    let yOffset: number;
    switch (layer) {
      case Layer.BACKGROUND_LAYER_1:
        backgroundColor = fromHex("#0a9bd5");
        rowIndex = 0;
        yOffset = 50;
        break;
      case Layer.BACKGROUND_LAYER_2:
        backgroundColor = fromHex("#018cc4");
        rowIndex = 1;
        yOffset = 15;
        break;
      case Layer.BACKGROUND_LAYER_3:
        backgroundColor = fromHex("#0281b5");
        rowIndex = 2;
        yOffset = 0;
        break;
    }

    const visibleTiles = getVisibleTilesForLayer(layer);
    visibleTiles.rects.forEach((rect) => {
      const { hillColumnIndices, hillPositions } = getHillTile(rect, layer);

      // Fill in the visual space beneath the hills with solid color
      // Overlap slightly so there's no visible partial line
      // Note the extra 1 pixel prevents sub-pixel gaps
      canvas.fill(backgroundColor);
      canvas.rect(rect.x, rect.height - yOffset - 1, rect.width, yOffset + 1);

      hillColumnIndices.forEach((spriteIndex, index) => {
        const sprite = hillSpriteSheet.getSpriteInCell(spriteIndex, rowIndex);
        const x = rect.x + hillPositions[index];
        const y = canvas.height - hillSpriteSheet.spriteSize.height - yOffset;

        canvas.drawSprite(sprite, x, y);
      });
    });
  }

  scheduleRenderWork((data, canvas) => {
    renderHillsForLayer(Layer.BACKGROUND_LAYER_1, canvas);
  }, Layer.BACKGROUND_LAYER_1);

  scheduleRenderWork((data, canvas) => {
    renderHillsForLayer(Layer.BACKGROUND_LAYER_2, canvas);
  }, Layer.BACKGROUND_LAYER_2);

  scheduleRenderWork((data, canvas) => {
    renderHillsForLayer(Layer.BACKGROUND_LAYER_3, canvas);
  }, Layer.BACKGROUND_LAYER_3);

  scheduleRenderWork((data, canvas) => {
    const visibleTiles = getVisibleTilesForLayer(Layer.BACKGROUND_LAYER_4);
    visibleTiles.rects.forEach((rect) => {
      const { featurePositions } = getFeatureTile(rect);

      featurePositions.forEach((position, index) => {
        const sprite =
          featureSpriteSheet.sprites[index % featureSpriteSheet.sprites.length];

        const x = rect.x + position * rect.width;
        const y = canvas.height - sprite.height;

        canvas.drawSprite(sprite, x, y);
      });
    });
  }, Layer.BACKGROUND_LAYER_4);

  scheduleRenderWork((data, canvas) => {
    const visibleTiles = getVisibleTilesForLayer(Layer.BACKGROUND_LAYER_5);
    visibleTiles.rects.forEach((rect) => {
      const { animatedSpritesSmall, spritePositionsSmall } =
        getSeaweedTile(rect);

      for (let index = 0; index < spritePositionsSmall.length; index++) {
        const animated = animatedSpritesSmall[index];
        const sprite = animated.getFrame();

        const position = spritePositionsSmall[index];
        const x = rect.x + position * rect.width;
        const y = canvas.height - sprite.height - SEAWEED_BOTTOM_MARGIN;

        canvas.drawSprite(sprite, x, y);
      }
    });

    // Simulate big bubbles coming up from random spots on the ocean floor
    if (data.frameNumber % 100 === 0) {
      const { xStart, xStop } = visibleTiles;

      addBubbles({
        count: Math.round(random(2, 8)),
        layer: Layer.BACKGROUND_LAYER_3,
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
  }, Layer.BACKGROUND_LAYER_5);
}
