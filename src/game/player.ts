import {
  PLAYER_LAYER,
  registerRenderFunction,
  handleResize,
} from "../scheduling/drawing";
import { canvas } from "../main";
import { arrowKeyWatcher } from "../utils/arrowKeyWatcher";
import { createMoveableVector } from "../utils/createMoveableVector";
import { createAnimatedFishSpriteHelper } from "../utils/drawing/spritesheets/createAnimatedFishSpriteHelper";
import { random } from "../utils/random";
import { addBubble } from "./bubble";
import { setPlayerPosition } from "./sharedState";

// TODO Add more ways to control the fish;
// Right now we support arrow keys and WASD
// Ideally we would also support click/touch to move to a location
// It's not clear how these two modes would interact/interfere with each other though!

// TODO Share more code with initNpcFish
// Swimming, breathing, etc are all too similar to have this much duplication

const SPRITE_HEIGHT = 13;
const SPRITE_WIDTH = 26;
const FULL_VELOCITY = 250;
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
    maxLocation.x = canvas.width - SPRITE_WIDTH;
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

  registerRenderFunction((data, canvas) => {
    const acceleration = moveableLocation.getAcceleration();
    const position = moveableLocation.getPosition();
    const velocity = moveableLocation.getVelocity();

    setPlayerPosition(position);

    // Cache direct so that the fish doesn't flip back when at rest
    if (acceleration.x < 0) {
      direction = "backward";
    } else if (acceleration.x > 0) {
      direction = "forward";
    }

    const sprite = animatedSpriteHelper.getSprite(direction, velocity.x !== 0);

    canvas.drawSprite(sprite, position.x, position.y);

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
