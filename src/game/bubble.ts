import { canvas } from "../main";
import { Layer, registerRenderFunction } from "../scheduling/drawing";
import { schedulePreloadWork } from "../scheduling/initialization";
import { Sprite } from "../utils/drawing/Sprites";
import { createAnimatedSpriteHelper } from "../utils/drawing/spritesheets/createAnimatedSpriteHelper";
import { createSpritesFromGrid } from "../utils/drawing/spritesheets/createSpritesFromGrid";
import { GridSpriteSheet } from "../utils/drawing/spritesheets/types";
import { random } from "../utils/random";

const PIXELS_PER_SECOND = 50;

let bigSpriteSheet: GridSpriteSheet;
let smallSpriteSheet: GridSpriteSheet;

export function addBubble({
  layer,
  partialPosition = {},
  partialVelocity = {},
  size,
}: {
  layer: Layer;
  partialPosition?: { x?: number; y?: number };
  partialVelocity?: { x?: number; y?: number };
  size: "bigger" | "regular" | "smaller" | "smallest";
}) {
  let minIndex = 0;
  switch (size) {
    case "smaller": {
      minIndex = 1;
      break;
    }
    case "smallest": {
      minIndex = 2;
      break;
    }
  }

  let spriteSheet = size === "bigger" ? bigSpriteSheet : smallSpriteSheet;

  let rowIndex = Math.floor(Math.random() * spriteSheet.rowCount);
  let startColumnIndex: number = Math.floor(
    random(minIndex, spriteSheet.columnCount)
  );

  let position = {
    x: partialPosition?.x ?? random(0, canvas.width),
    y: partialPosition?.y ?? random(0, canvas.height),
  };
  let velocity = {
    x: partialVelocity?.x ?? 0,
    y: partialVelocity?.y ?? random(-1, -0.5),
  };

  let frames: Sprite[] = [];
  for (
    let columnIndex = startColumnIndex;
    columnIndex < spriteSheet.columnCount;
    columnIndex++
  ) {
    frames.push(spriteSheet.getSpriteInCell(columnIndex, rowIndex));
  }

  const { getFrame } = createAnimatedSpriteHelper({
    frames,
    framesPerSecond: 2,
    loop: false,
  });

  const unregister = registerRenderFunction((data, canvas) => {
    // TODO Wobble left to right
    const deltaTimeInSeconds = data.timeSinceLastFrameMs / 1_000;

    position.x += velocity.x * PIXELS_PER_SECOND * deltaTimeInSeconds;
    position.y += velocity.y * PIXELS_PER_SECOND * deltaTimeInSeconds;

    if (position.y <= 0) {
      unregister();
    } else {
      const sprite = getFrame();
      if (sprite) {
        canvas.drawSprite(sprite, position.x, position.y);
      } else {
        unregister();
      }
    }
  }, layer);
}

export function initBubbles() {
  schedulePreloadWork(() => {
    bigSpriteSheet = createSpritesFromGrid("/images/sprites/big-bubbles.gif", {
      width: 13,
      height: 13,
    });
    smallSpriteSheet = createSpritesFromGrid("/images/sprites/bubbles.gif", {
      width: 4,
      height: 4,
    });
  });
}
