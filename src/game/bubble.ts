import { Layer, registerDraw, registerPreload } from "../drawing";
import { canvas } from "../main";
import { Sprite } from "../utils/drawing/Sprites";
import { createAnimatedSpriteHelper } from "../utils/drawing/spritesheets/createAnimatedSpriteHelper";
import { createSprites } from "../utils/drawing/spritesheets/createSprites";
import { createSpritesFromGrid } from "../utils/drawing/spritesheets/createSpritesFromGrid";
import {
  GridSpriteSheet,
  SpriteSheet,
} from "../utils/drawing/spritesheets/types";
import { random } from "../utils/random";

const PIXELS_PER_SECOND = 50;

const POSITIONS = [
  {
    x: 1,
    y: 1,
    size: 11,
  },
  {
    x: 13,
    y: 1,
    size: 9,
  },
  {
    x: 23,
    y: 1,
    size: 7,
  },
  {
    x: 31,
    y: 1,
    size: 7,
  },
  {
    x: 39,
    y: 1,
    size: 5,
  },
  {
    x: 45,
    y: 1,
    size: 5,
  },
  {
    x: 51,
    y: 1,
    size: 4,
  },
  {
    x: 56,
    y: 1,
    size: 2,
  },
  {
    x: 59,
    y: 1,
    size: 1,
  },
];

let bigSpriteSheet: SpriteSheet;
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

  let spriteCount =
    size === "bigger"
      ? bigSpriteSheet.sprites.length
      : smallSpriteSheet.columnCount;

  let rowIndex = Math.floor(Math.random() * 3);
  let startColumnIndex: number = Math.floor(random(minIndex, spriteCount));

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
    columnIndex < spriteCount;
    columnIndex++
  ) {
    frames.push(
      size === "bigger"
        ? bigSpriteSheet.getSpriteAtCoordinates(
            POSITIONS[columnIndex].x,
            POSITIONS[columnIndex].y
          )
        : smallSpriteSheet.getSpriteInCell(columnIndex, rowIndex)
    );
  }

  const { getFrame } = createAnimatedSpriteHelper({
    frames,
    framesPerSecond: 2,
    loop: false,
  });

  const unregister = registerDraw((data, canvas) => {
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
  registerPreload(() => {
    smallSpriteSheet = createSpritesFromGrid("/images/sprites/bubbles.gif", {
      width: 4,
      height: 4,
    });

    bigSpriteSheet = createSprites(
      "/images/sprites/big-bubbles.gif",
      (addSprite) => {
        POSITIONS.forEach(({ x, y, size }) => addSprite(x, y, size, size));
      }
    );
  });
}
