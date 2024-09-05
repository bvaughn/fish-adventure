import { DEBUG_POSITIONS } from "../constants";
import { canvas } from "../main";
import { scheduleSetupWork } from "../scheduling/initialization";
import {
  NPC_LAYER,
  scheduleNPCPreRenderUpdate,
  scheduleRenderWork,
} from "../scheduling/rendering";
import { Vector } from "../types";
import { createMoveableVector } from "../utils/createMoveableVector";
import { createNoise } from "../utils/createNoise";
import { fromHex } from "../utils/drawing/Color";
import {
  VARIANTS,
  Variant,
  createAnimatedNpcFishSpriteHelper,
  initAnimatedNpcFishSpriteHelper,
} from "../utils/drawing/spritesheets/createAnimatedNpcFishSpriteHelper";
import { random } from "../utils/random";
import { addBubbles } from "./bubble";
import { screen } from "./sharedState";

const BREATHING_RATE_MS = 2_000;
const POSITION_PADDING = 15;
const PIXELS_PER_SECOND_Y = 50;
const PIXELS_PER_SECOND_X = 100;

let id = 0;
let variantsOnScreen: Map<Variant, number> = new Map();

export function addNPC(variant: Variant, respawn = false) {
  if (variantsOnScreen.has(variant)) {
    // console.debug(
    //   `Cannot render ${variant} NPC; already on screen with id ${variantsOnScreen.get(variant)}`
    // );
    return;
  }

  const uid = id++;

  variantsOnScreen.set(variant, uid);

  const helper = createAnimatedNpcFishSpriteHelper(variant);

  const minLocation = { x: 0 - helper.size.width, y: 0 };
  const rateOfBreathing = Math.round(BREATHING_RATE_MS * random(0.075, 1.25));

  let noise = createNoise();

  const moveableVector = createMoveableVector({
    friction: 0,
    initialLocation: {
      x: respawn ? screen.x * 2 + canvas.width : random(0, canvas.width),
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
  });

  let position: Vector;
  let shouldBreathe = false;
  let timeOfLastBreathe = performance.now();
  let velocity: Vector;

  const unschedulePreRenderUpdate = scheduleNPCPreRenderUpdate(
    ({ timestamp }) => {
      // Use perlin noise to add some speed and depth variation to the fish
      const perlin = noise.getPerlin2d(
        moveableVector.getPosition().x * 0.005,
        0
      );
      if (perlin < 0.05) {
        moveableVector.setAccelerationX(PIXELS_PER_SECOND_X);
      } else if (perlin > 0.95) {
        moveableVector.setAccelerationX(-PIXELS_PER_SECOND_X);
      }
      moveableVector.setVelocityY((perlin - 0.5) * 25);

      position = moveableVector.getPosition();
      velocity = moveableVector.getVelocity();

      // Simulate breathing with random bubbles every now and then
      if (timestamp - timeOfLastBreathe > rateOfBreathing) {
        shouldBreathe = true;
        timeOfLastBreathe = timestamp;
      }

      // Bounds check
      // Once the fish has moved beyond the rendered area, we can stop updating it
      if (position.x <= 0 - helper.size.width) {
        unschedulePreRenderUpdate();
        unscheduleRenderWork();

        variantsOnScreen.delete(variant);
      }
    }
  );

  const unscheduleRenderWork = scheduleRenderWork((data, canvas) => {
    const sprite = helper.getSprite();
    if (!position) {
      console.warn(`No position for NPC ${uid}`);
      return;
    }
    canvas.drawSprite(sprite, position.x, position.y);

    if (DEBUG_POSITIONS) {
      canvas.font("6px sans-serif");
      canvas.fill(fromHex("#ffffff"));
      canvas.stroke(fromHex("#000000"));
      canvas.drawText(
        position.x + sprite.width / 2,
        position.y + sprite.height + 5,
        `[${uid}] ${Math.round(position.x)}, ${Math.round(position.y)}`
      );
    }

    if (shouldBreathe) {
      shouldBreathe = false;

      addBubbles({
        count: Math.round(random(1, 4)),
        layer: NPC_LAYER,
        position,
        partialVelocity: {
          x: velocity.x * 0.001,
        },
        size: "regular",
      });
    }
  }, NPC_LAYER);
}

export function initNPCs() {
  initAnimatedNpcFishSpriteHelper();

  scheduleSetupWork(() => {
    VARIANTS.forEach((variant) => {
      addNPC(variant);
    });
  });

  // Randomly spawn in new NPCs beyond the map's edge
  // TODO Aim for some screen density of fish; 1 per second is probably too much.
  setInterval(() => {
    const variant = VARIANTS[Math.floor(random(0, VARIANTS.length))];
    addNPC(variant, true);
  }, 1_000);
}
