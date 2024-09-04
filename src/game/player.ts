import { DEBUG_POSITIONS, MAX_OFFSET_X } from "../constants";
import { canvas } from "../main";
import {
  handleResize,
  PLAYER_LAYER,
  scheduleRenderWork,
} from "../scheduling/drawing";
import { schedulePlayerPreRenderUpdate } from "../scheduling/gameLogic";
import { Vector } from "../types";
import { arrowKeyWatcher } from "../utils/arrowKeyWatcher";
import { createMoveableVector } from "../utils/createMoveableVector";
import { fromHex } from "../utils/drawing/Color";
import { createAnimatedFishSpriteHelper } from "../utils/drawing/spritesheets/createAnimatedFishSpriteHelper";
import { random } from "../utils/random";
import { addBubble } from "./bubble";
import { updatePlayerPosition } from "./sharedState";

// TODO Share more code with initNpcFish
// Swimming, breathing, etc are all too similar to have this much duplication

const SPRITE_HEIGHT = 13;
const SPRITE_WIDTH = 26;
const FULL_VELOCITY = 250;
const TIME_TO_STOP_FROM_FRICTION = 1_000;
const TIME_TO_REACH_FULL_VELOCITY = 500;

// TODO Move motion/location processing out of drawing methods
// Player and NPC positions and velocity should be updated before drawing
// So that everything draws in-sync regardless of layering order

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
  let velocity: Vector;

  schedulePlayerPreRenderUpdate(() => {
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
  });

  scheduleRenderWork((data, canvas) => {
    const sprite = animatedSpriteHelper.getSprite(direction, velocity.x !== 0);

    canvas.drawSprite(sprite, position.x, position.y);

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

    // Simulate breathing with random bubbles every now and then
    // TODO More bubbles when moving faster, less when standing still
    // TODO Move this code into the createAnimatedFishSpriteHelper?
    if (data.frameNumber % 45 === 0) {
      const numBubbles = Math.round(random(2, 8));
      for (let i = 0; i < numBubbles; i++) {
        let x = position.x;
        x += random(-2, 2);
        if (direction === "forward") {
          x += SPRITE_HEIGHT; // ???
        }

        let y = position.y;
        y += random(-2, 2);

        addBubble({
          layer: PLAYER_LAYER,
          partialPosition: { x, y },
          partialVelocity: {
            x: velocity.x * 0.001,
          },
          size: "regular",
        });
      }
    }
  }, PLAYER_LAYER);
}
