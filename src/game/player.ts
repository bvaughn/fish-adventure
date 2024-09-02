import { PLAYER_LAYER, registerDraw, registerResize } from "../drawing";
import { canvas } from "../main";
import { arrowKeyWatcher } from "../utils/arrowKeyWatcher";
import { createMoveableLocation } from "../utils/createMoveableLocation";
import { createAnimatedFishSpriteHelper } from "../utils/drawing/spritesheets/createAnimatedFishSpriteHelper";
import { random } from "../utils/random";
import { addBubble } from "./bubble";

// TODO Add more ways to control the fish;
// Right now we support arrow keys and WASD
// Ideally we would also support click/touch to move to a location
// It's not clear how these two modes would interact/interfere with each other though!

// TODO Share more code with initNpcFish
// Swimming, breathing, etc are all too similar to have this much duplication

const SPRITE_HEIGHT = 13;
const SPRITE_WIDTH = 26;
const PIXELS_PER_SECOND = 2_000;
const RATE_OF_ACCELERATION = 0.25;

export function initPlayer() {
  const animatedSpriteHelper = createAnimatedFishSpriteHelper({
    size: {
      width: 26,
      height: 13,
    },
    source: "/images/sprites/fish-player-alt.gif",
  });
  const maxLocation = { x: 0, y: 0 };

  let direction: "forward" | "backward" = "forward";

  registerResize(() => {
    updateMaxLocation();
  });

  const updateMaxLocation = () => {
    maxLocation.x = canvas.width - SPRITE_WIDTH;
    maxLocation.y = canvas.height - SPRITE_HEIGHT;
  };

  updateMaxLocation();

  const moveableLocation = createMoveableLocation({
    initialLocation: { x: 100, y: 100 },
    maxLocation,
    scale: PIXELS_PER_SECOND,
  });

  arrowKeyWatcher((leftRight, upDown) => {
    switch (leftRight) {
      case "left": {
        moveableLocation.acceleration.x = -RATE_OF_ACCELERATION;
        break;
      }
      case "right": {
        moveableLocation.acceleration.x = RATE_OF_ACCELERATION;
        break;
      }
      default: {
        moveableLocation.acceleration.x = 0;
        break;
      }
    }

    switch (upDown) {
      case "down": {
        moveableLocation.acceleration.y = RATE_OF_ACCELERATION;
        break;
      }
      case "up": {
        moveableLocation.acceleration.y = -RATE_OF_ACCELERATION;
        break;
      }
      default: {
        moveableLocation.acceleration.y = 0;
        break;
      }
    }
  });

  registerDraw((data, canvas) => {
    // Cache direct so that the fish doesn't flip back when at rest
    if (moveableLocation.acceleration.x < 0) {
      direction = "backward";
    } else if (moveableLocation.acceleration.x > 0) {
      direction = "forward";
    }

    moveableLocation.update();

    const sprite = animatedSpriteHelper.getSprite(direction);

    canvas.drawSprite(
      sprite,
      moveableLocation.location.x,
      moveableLocation.location.y
    );

    // Simulate breathing with random bubbles every now and then
    // TODO More bubbles when moving faster, less when standing still
    if (data.frameNumber % 45 === 0) {
      const numBubbles = Math.round(random(2, 8));
      for (let i = 0; i < numBubbles; i++) {
        let x = moveableLocation.location.x;
        x += random(-2, 2);
        if (direction === "forward") {
          x += SPRITE_HEIGHT; // ???
        }

        let y = moveableLocation.location.y;
        y += random(-2, 2);

        addBubble({
          layer: PLAYER_LAYER,
          partialPosition: { x, y },
          partialVelocity: {
            x: moveableLocation.velocity.x / 2,
          },
          size: "regular",
        });
      }
    }
  }, PLAYER_LAYER);
}
