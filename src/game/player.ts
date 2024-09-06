import { DEBUG_POSITIONS, MAX_OFFSET_X, TILE_SIZE } from "../constants";
import { canvas } from "../main";
import {
  handleResize,
  Layer,
  schedulePlayerPreRenderUpdate,
  scheduleRenderWork,
} from "../scheduling/rendering";
import { Vector } from "../types";
import { arrowKeyWatcher } from "../utils/arrowKeyWatcher";
import { createMoveableVector } from "../utils/createMoveableVector";
import { fromHex } from "../utils/drawing/Color";
import { createAnimatedFishSpriteHelper } from "../utils/drawing/spritesheets/createAnimatedFishSpriteHelper";
import { random } from "../utils/random";
import { addBubbles } from "./bubble";
import { updatePlayerPosition } from "./sharedState";

const BREATHING_RATE_AT_REST_MS = 2_000;
const BREATHING_RATE_WHEN_SWIMMING_MS = 1_250;
const FULL_VELOCITY = 250;
const SPRITE_HEIGHT = 13;
const SPRITE_WIDTH = 26;
const TIME_TO_STOP_FROM_FRICTION = 1_000;
const TIME_TO_REACH_FULL_VELOCITY = 500;

export function initPlayer() {
  const animatedSpriteHelper = createAnimatedFishSpriteHelper({
    size: {
      width: 25,
      height: 13,
    },
    source: "/images/sprites/fish-player.gif",
  });
  const maxLocation = { x: 0, y: 0 };

  let direction: "forward" | "backward" = "forward";

  handleResize(() => {
    updateMaxLocation();
  });

  const updateMaxLocation = () => {
    maxLocation.x = MAX_OFFSET_X - SPRITE_WIDTH;
    maxLocation.y = canvas.height - SPRITE_HEIGHT;
  };

  updateMaxLocation();

  const moveableLocation = createMoveableVector({
    friction: (1_000 / TIME_TO_STOP_FROM_FRICTION) * FULL_VELOCITY,
    initialLocation: { x: 100, y: 100 },
    maxLocation,
    minVelocity: { x: -FULL_VELOCITY, y: -FULL_VELOCITY },
    maxVelocity: { x: FULL_VELOCITY, y: FULL_VELOCITY },
  });

  arrowKeyWatcher((leftRight, upDown) => {
    const acceleration = (1_000 / TIME_TO_REACH_FULL_VELOCITY) * FULL_VELOCITY;

    switch (leftRight) {
      case "left": {
        moveableLocation.setAccelerationX(-acceleration);
        break;
      }
      case "right": {
        moveableLocation.setAccelerationX(acceleration);
        break;
      }
      default: {
        moveableLocation.setAccelerationX(0);
        break;
      }
    }

    switch (upDown) {
      case "down": {
        moveableLocation.setAccelerationY(acceleration);
        break;
      }
      case "up": {
        moveableLocation.setAccelerationY(-acceleration);
        break;
      }
      default: {
        moveableLocation.setAccelerationY(0);
        break;
      }
    }
  });

  let acceleration: Vector;
  let position: Vector;
  let shouldBreathe = false;
  let timeOfLastBreathe = performance.now();
  let velocity: Vector;

  schedulePlayerPreRenderUpdate(({ timestamp }) => {
    acceleration = moveableLocation.getAcceleration();
    position = moveableLocation.getPosition();
    velocity = moveableLocation.getVelocity();

    // Cache direct so that the fish doesn't flip back when at rest
    if (acceleration.x < 0) {
      direction = "backward";
    } else if (acceleration.x > 0) {
      direction = "forward";
    }

    updatePlayerPosition(
      { width: SPRITE_WIDTH, height: SPRITE_HEIGHT },
      position,
      velocity
    );

    // Bounce off the max location, like there's some kind of invisible current
    // (We might want to change this eventually but...)
    if (position.x + SPRITE_WIDTH >= MAX_OFFSET_X) {
      moveableLocation.setVelocityX(0 - FULL_VELOCITY / 2);
    }

    // Breathe a little faster when swimming
    const velocityAmount = Math.abs(velocity.x) / FULL_VELOCITY;
    const breathingInterval =
      BREATHING_RATE_AT_REST_MS -
      velocityAmount *
        (BREATHING_RATE_AT_REST_MS - BREATHING_RATE_WHEN_SWIMMING_MS);

    // Simulate breathing with random bubbles every now and then
    if (timestamp - timeOfLastBreathe > breathingInterval) {
      shouldBreathe = true;
      timeOfLastBreathe = timestamp;
    }
  });

  scheduleRenderWork((data, canvas) => {
    const sprite = animatedSpriteHelper.getSprite(direction, velocity.x !== 0);

    canvas.drawSprite(sprite, position.x, position.y);

    if (position.x + TILE_SIZE / 2 >= MAX_OFFSET_X) {
      canvas.pushDrawingState();
      canvas.positioning("static");
      canvas.font("10px sans-serif");
      canvas.fill(fromHex("#ffffff"));
      canvas.stroke(fromHex("#000000"));
      canvas.drawText(
        canvas.width / 2,
        canvas.height / 2,
        "You've reached the end of the map (for now)!"
      );
      canvas.popDrawingState();
    }

    if (DEBUG_POSITIONS) {
      canvas.font("6px sans-serif");
      canvas.fill(fromHex("#ffffff"));
      canvas.stroke(fromHex("#000000"));
      canvas.drawText(
        position.x + sprite.width / 2,
        position.y + sprite.height + 5,
        `${Math.round(position.x)}, ${Math.round(position.y)}`
      );
    }

    if (shouldBreathe) {
      shouldBreathe = false;

      addBubbles({
        count: Math.round(random(2, 8)),
        layer: Layer.PLAYER_LAYER,
        position: {
          x: direction === "forward" ? position.x + SPRITE_WIDTH : position.x,
          y: position.y,
        },
        partialVelocity: {
          x: velocity.x * 0.001,
        },
        size: "regular",
      });
    }
  }, Layer.PLAYER_LAYER);
}
