import * as P5 from "p5";
import { api, registerDraw, registerPreload, registerSetup, size } from "../p5";
import { createMoveableLocation } from "../utils/createMoveableLocation";
import { createSpriteSheet, SpriteSheet } from "../utils/p5/createSprite";
import { drawScaledImage } from "../utils/p5/drawScaledImage";
import { initBubble } from "./initBubble";

const SPRITE_HEIGHT = 13;
const SPRITE_WIDTH = 26;
const PIXELS_PER_SECOND = 1_500;

let image: P5.Image;
let spriteSheet: SpriteSheet;

registerPreload((api) => {
  image = api.loadImage("/images/sprites/fish-npc.gif");
});

registerSetup(() => {
  spriteSheet = createSpriteSheet({
    image,
    spriteSize: { width: SPRITE_WIDTH, height: SPRITE_HEIGHT },
  });
});

export function initNpcFish() {
  const minLocation = api.createVector(0 - SPRITE_WIDTH * size.pixelScale, 0);

  const rateOfBreathing = Math.round(api.random(35, 60));
  const breathingFrameOffset = Math.round(api.random(0, rateOfBreathing));

  const moveableLocation = createMoveableLocation({
    api,
    friction: 0,
    initialLocation: api.createVector(
      api.random(0, size.width),
      api.random(0, size.height)
    ),
    initialVelocity: api.createVector(api.random(-0.04, -0.08), 0),
    minLocation,
    scale: PIXELS_PER_SECOND,
  });

  registerDraw(function drawFish(api) {
    api.push();
    api.noStroke();

    // Swim animation frames (if moving)
    const frameIndex = api.frameCount % 30 < 15 ? 0 : 1;
    const image = spriteSheet.getFrame(frameIndex, 1);

    // Simulate breathing with random bubbles every now and then
    if ((api.frameCount + breathingFrameOffset) % rateOfBreathing === 0) {
      const numBubbles = Math.round(api.random(1, 3));
      for (let i = 0; i < numBubbles; i++) {
        let x = moveableLocation.location.x;
        x += api.random(-size.pixelScale * 2, size.pixelScale * 2);

        let y = moveableLocation.location.y;
        y += api.random(-size.pixelScale * 2, size.pixelScale * 2);

        initBubble({
          position: { x, y },
          velocity: {
            x: moveableLocation.velocity.x / 2,
          },
        });
      }
    }

    const before = moveableLocation.location.x;
    moveableLocation.update();

    if (moveableLocation.location.x === minLocation.x) {
      moveableLocation.velocity.x = api.random(-0.04, -0.08);
      moveableLocation.location.x = size.width;
    }

    drawScaledImage({
      api,
      image,
      scale: size.pixelScale,
      translateX: moveableLocation.location.x,
      translateY: moveableLocation.location.y,
    });

    api.pop();
  });

  return function destroy() {};
}
