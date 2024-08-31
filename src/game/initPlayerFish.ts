import * as P5 from "p5";
import {
  api,
  PLAYER_LAYER,
  registerDraw,
  registerPreload,
  registerResize,
  registerSetup,
  size,
} from "../p5";
import { arrowKeyWatcher } from "../utils/arrowKeyWatcher";
import { createMoveableLocation } from "../utils/createMoveableLocation";
import { createSpriteSheet, SpriteSheet } from "../utils/p5/createSpriteSheet";
import { drawScaledImage } from "../utils/p5/drawScaledImage";
import { initBubble } from "./initBubble";

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

let image: P5.Image;
let spriteSheet: SpriteSheet;

registerPreload((api) => {
  image = api.loadImage("/images/sprites/fish-player.gif");
});

registerSetup(() => {
  spriteSheet = createSpriteSheet({
    image,
    spriteSize: { width: SPRITE_WIDTH, height: SPRITE_HEIGHT },
  });
});

export function initPlayerFish() {
  let direction: "front" | "back" = "front";

  const maxLocation = api.createVector(0, 0);

  const updateMaxLocation = () => {
    maxLocation.x = size.width - SPRITE_WIDTH * size.pixelScale;
    maxLocation.y = size.height - SPRITE_HEIGHT * size.pixelScale;
  };

  updateMaxLocation();

  const moveableLocation = createMoveableLocation({
    api,
    initialLocation: api.createVector(100, 100),
    maxLocation,
    scale: PIXELS_PER_SECOND,
  });

  const destroyArrowKeyWatcher = arrowKeyWatcher((leftRight, upDown) => {
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

  registerResize(() => {
    updateMaxLocation();
  });

  registerDraw(function drawFish(api) {
    api.push();
    api.noStroke();

    // Cache direct so that the fish doesn't flip back when at rest
    if (moveableLocation.velocity.x < 0) {
      direction = "back";
    } else if (moveableLocation.velocity.x > 0) {
      direction = "front";
    }

    // Swim animation frames (if moving)
    const frameIndex = api.frameCount % 30 < 15 ? 0 : 1;
    const image = spriteSheet.getFrame(
      frameIndex,
      direction === "front" ? 0 : 1
    );

    // Simulate breathing with random bubbles every now and then
    // TODO More bubbles when moving faster, less when standing still
    if (api.frameCount % 45 === 0) {
      const numBubbles = Math.round(api.random(2, 8));
      for (let i = 0; i < numBubbles; i++) {
        let x = moveableLocation.location.x;
        x += api.random(-size.pixelScale * 2, size.pixelScale * 2);
        if (direction === "front") {
          x += SPRITE_HEIGHT * size.pixelScale - size.pixelScale;
        }

        let y = moveableLocation.location.y;
        y += api.random(-size.pixelScale * 2, size.pixelScale * 2);

        initBubble({
          layer: PLAYER_LAYER,
          position: { x, y },
          velocity: {
            x: moveableLocation.velocity.x / 2,
          },
        });
      }
    }

    moveableLocation.update();

    drawScaledImage({
      api,
      image,
      scale: size.pixelScale,
      translateX: moveableLocation.location.x,
      translateY: moveableLocation.location.y,
    });

    api.pop();
  }, PLAYER_LAYER);

  return function destroy() {
    destroyArrowKeyWatcher();
  };
}