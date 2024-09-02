import {
  BACKGROUND_LAYER_3,
  registerDraw,
  registerPreload,
  registerSetup,
} from "../drawing";
import { canvas } from "../main";
import { assert } from "../utils/assert";
import { createMoveableLocation } from "../utils/createMoveableLocation";
import { createSprites } from "../utils/drawing/spritesheets/createSprites";
import { SpriteSheet } from "../utils/drawing/spritesheets/types";
import { random } from "../utils/random";

export type Variant = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const DIMENSIONS = [
  { x: 0, y: 0, width: 22, height: 8 },
  { x: 0, y: 10, width: 23, height: 24 },
  { x: 0, y: 36, width: 26, height: 12 },
  { x: 0, y: 50, width: 25, height: 20 },
  { x: 0, y: 72, width: 30, height: 12 },
  { x: 0, y: 86, width: 21, height: 17 },
  { x: 0, y: 105, width: 26, height: 16 },
  { x: 0, y: 123, width: 26, height: 18 },
];
const PIXELS_PER_SECOND = 1_250;

let spriteSheet: SpriteSheet;

// Add some random acceleration/deceleration to the NPCs

export function addNPC(variant: Variant) {
  const data = DIMENSIONS[variant - 1];
  assert(data, `Invalid variant: ${variant}`);

  let sprite = spriteSheet.getSpriteAtCoordinates(data.x, data.y);
  let speedMultiplier = 1;

  const minLocation = { x: 0 - sprite.width, y: 0 };

  const moveableLocation = createMoveableLocation({
    friction: 0,
    initialLocation: {
      x: random(0, canvas.width),
      y: random(0, canvas.height - sprite.height),
    },
    initialVelocity: {
      x: random(-0.04 * speedMultiplier, -0.08 * speedMultiplier),
      y: 0,
    },
    minLocation,
    scale: PIXELS_PER_SECOND,
  });

  registerDraw((data, canvas) => {
    moveableLocation.update();

    // Bounds check
    if (moveableLocation.location.x === minLocation.x) {
      moveableLocation.velocity.x = random(-0.04, -0.08);
      moveableLocation.location.x = canvas.width;

      moveableLocation.location.y = random(0, canvas.height - sprite.height);
    }

    canvas.drawSprite(
      sprite,
      moveableLocation.location.x,
      moveableLocation.location.y
    );
  }, BACKGROUND_LAYER_3);
}

export function initNPCs() {
  registerPreload(async () => {
    spriteSheet = createSprites(
      "/images/sprites/fish-npc-assorted.gif",
      (addSprite) => {
        DIMENSIONS.forEach(({ height, width, x, y }) => {
          addSprite(x, y, width, height);
        });
      }
    );
  });

  registerSetup(() => {
    ([1, 2, 3, 4, 5, 6, 7, 8] as Variant[]).forEach((variant) => {
      addNPC(variant);
    });
  });
}
