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
import { addBubble } from "./bubble";
import {
  Variant,
  createAnimatedNpcFishSpriteHelper,
  initAnimatedNpcFishSpriteHelper,
} from "../utils/drawing/spritesheets/createAnimatedNpcFishSpriteHelper";

const POSITION_PADDING = 15;
const PIXELS_PER_SECOND = 1_250;

// TODO Animate NPC swimming

// TODO Add some random acceleration/deceleration to the NPCs

export function addNPC(variant: Variant) {
  const helper = createAnimatedNpcFishSpriteHelper(variant);

  const minLocation = { x: 0 - helper.size.width, y: 0 };
  const rateOfBreathing = Math.round(random(0.5, 1.5) * 45);

  const moveableLocation = createMoveableLocation({
    friction: 0,
    initialLocation: {
      x: random(0, canvas.width),
      y: random(
        POSITION_PADDING,
        canvas.height - helper.size.height - POSITION_PADDING
      ),
    },
    initialVelocity: {
      x: random(-0.02, -0.07),
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

      moveableLocation.location.y = random(
        0,
        canvas.height - helper.size.height
      );
    }

    const sprite = helper.getSprite();
    canvas.drawSprite(
      sprite,
      moveableLocation.location.x,
      moveableLocation.location.y
    );

    // Simulate breathing with random bubbles every now and then
    // TODO More bubbles when moving faster, less when standing still
    // TODO Move this code into the createAnimatedFishSpriteHelper?
    if (data.frameNumber % rateOfBreathing === 0) {
      const numBubbles = Math.round(random(1, 4));
      for (let i = 0; i < numBubbles; i++) {
        let x = moveableLocation.location.x;
        x += random(-2, 2);

        let y = moveableLocation.location.y;
        y += random(-2, 2);

        addBubble({
          layer: BACKGROUND_LAYER_3,
          partialPosition: { x, y },
          partialVelocity: {
            x: moveableLocation.velocity.x / 2,
          },
          size: "regular",
        });
      }
    }
  }, BACKGROUND_LAYER_3);
}

export function initNPCs() {
  initAnimatedNpcFishSpriteHelper();

  registerSetup(() => {
    ([1, 2, 3, 4, 5, 6, 7, 8] as Variant[]).forEach((variant) => {
      addNPC(variant);
    });
  });
}
