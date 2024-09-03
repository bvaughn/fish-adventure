import { BACKGROUND_LAYER_3, registerDraw, registerSetup } from "../drawing";
import { canvas } from "../main";
import { createMoveableVector } from "../utils/createMoveableVector";
import { createNoise } from "../utils/createNoise";
import {
  Variant,
  createAnimatedNpcFishSpriteHelper,
  initAnimatedNpcFishSpriteHelper,
} from "../utils/drawing/spritesheets/createAnimatedNpcFishSpriteHelper";
import { random } from "../utils/random";
import { addBubble } from "./bubble";

const POSITION_PADDING = 15;
const PIXELS_PER_SECOND_Y = 50;
const PIXELS_PER_SECOND_X = 100;

export function addNPC(variant: Variant) {
  const helper = createAnimatedNpcFishSpriteHelper(variant);

  const maxLocation = {
    x: canvas.width,
    y: canvas.height - helper.size.height,
  };
  const minLocation = { x: 0 - helper.size.width, y: 0 };
  const rateOfBreathing = Math.round(random(0.5, 1.5) * 45);

  let noise = createNoise();

  const initMoveableVector = (reset = false) => {
    return createMoveableVector({
      friction: 0,
      initialLocation: {
        x: reset ? canvas.width : random(0, canvas.width),
        y: random(
          POSITION_PADDING,
          canvas.height - helper.size.height - POSITION_PADDING
        ),
      },
      initialVelocity: {
        x: random(-0.5, -1) * PIXELS_PER_SECOND_X,
        y: 0,
      },
      minVelocity: { x: -PIXELS_PER_SECOND_X, y: -PIXELS_PER_SECOND_Y },
      maxVelocity: { x: -PIXELS_PER_SECOND_X / 2, y: PIXELS_PER_SECOND_Y },
      minLocation,
      maxLocation,
    });
  };

  let moveableVector = initMoveableVector();

  registerDraw((data, canvas) => {
    // Use perlin noise to add some speed and depth variation to the fish
    const perlin = noise.getPerlin2d(moveableVector.getPosition().x * 0.005, 0);
    if (perlin < 0.05) {
      moveableVector.setAccelerationX(PIXELS_PER_SECOND_X);
    } else if (perlin > 0.95) {
      moveableVector.setAccelerationX(-PIXELS_PER_SECOND_X);
    }
    moveableVector.setVelocityY((perlin - 0.5) * 25);

    // Bounds check
    if (moveableVector.getPosition().x === minLocation.x) {
      noise = createNoise();
      moveableVector = initMoveableVector(true);
    }

    const position = moveableVector.getPosition();
    const velocity = moveableVector.getVelocity();

    const sprite = helper.getSprite();
    canvas.drawSprite(sprite, position.x, position.y);

    // Simulate breathing with random bubbles every now and then
    // TODO More bubbles when moving faster, less when standing still
    // TODO Move this code into the createAnimatedFishSpriteHelper?
    if (data.frameNumber % rateOfBreathing === 0) {
      const numBubbles = Math.round(random(1, 4));
      for (let i = 0; i < numBubbles; i++) {
        let x = position.x;
        x += random(-2, 2);

        let y = position.y;
        y += random(-2, 2);

        addBubble({
          layer: BACKGROUND_LAYER_3,
          partialPosition: { x, y },
          partialVelocity: {
            x: velocity.x * 0.001,
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
