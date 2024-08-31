import * as P5 from "p5";
import {
  api,
  Layer,
  BACKGROUND_LAYER_2,
  BACKGROUND_LAYER_3,
  PLAYER_LAYER_UNDERLAY,
  registerDraw,
  registerPreload,
  registerSetup,
  size,
} from "../p5";
import { assert } from "../utils/assert";
import { createMoveableLocation } from "../utils/createMoveableLocation";
import { createSpriteSheet, SpriteSheet } from "../utils/p5/createSpriteSheet";
import { drawScaledImage } from "../utils/p5/drawScaledImage";
import { initBubble } from "./initBubble";

// TODO Share more code with initPlayerFish
// Swimming, breathing, etc are all too similar to have this much duplication

type Size = "smallest" | "small" | "regular";
type NpcFishData = {
  height: number;
  image: P5.Image | null;
  layer: Layer;
  speedMultiplier: number;
  spriteSheet: SpriteSheet | null;
  width: number;
  url: string;
};

const npcFishData: { [size: string]: NpcFishData } = {
  regular: {
    height: 11,
    image: null,
    layer: PLAYER_LAYER_UNDERLAY,
    speedMultiplier: 1,
    spriteSheet: null,
    width: 25,
    url: "/images/sprites/fish-npc-regular.gif",
  },
  small: {
    height: 8,
    image: null,
    layer: BACKGROUND_LAYER_3,
    speedMultiplier: 0.6,
    spriteSheet: null,
    width: 18,
    url: "/images/sprites/fish-npc-small.gif",
  },
  smallest: {
    height: 4,
    image: null,
    layer: BACKGROUND_LAYER_2,
    speedMultiplier: 0.2,
    spriteSheet: null,
    width: 10,
    url: "/images/sprites/fish-npc-smallest.gif",
  },
};

const PIXELS_PER_SECOND = 1_500;

registerPreload((api) => {
  for (let size in npcFishData) {
    const data = npcFishData[size];
    data.image = api.loadImage(data.url);
  }
});

registerSetup(() => {
  for (let size in npcFishData) {
    const data = npcFishData[size];
    assert(data.image, "Sprite sheet not loaded");

    data.spriteSheet = createSpriteSheet({
      image: data.image,
      spriteSize: { width: data.width, height: data.height },
    });
  }
});

export function initNpcFish(variant: Size) {
  const fish = npcFishData[variant];

  const minLocation = api.createVector(0 - fish.width * size.pixelScale, 0);

  const rateOfBreathing = Math.round(api.random(35, 60));
  const breathingFrameOffset = Math.round(api.random(0, rateOfBreathing));

  const moveableLocation = createMoveableLocation({
    api,
    friction: 0,
    initialLocation: api.createVector(
      api.random(0, size.width),
      api.random(0, size.height - fish.height)
    ),
    initialVelocity: api.createVector(
      api.random(-0.04 * fish.speedMultiplier, -0.08 * fish.speedMultiplier),
      0
    ),
    minLocation,
    scale: PIXELS_PER_SECOND,
  });

  registerDraw(function drawFish(api) {
    assert(fish.spriteSheet, "Sprite sheet not loaded");

    api.push();
    api.noStroke();

    // Swim animation frames (if moving)
    const frameIndex = api.frameCount % 30 < 15 ? 0 : 1;
    const image = fish.spriteSheet.getFrame(frameIndex, 1);

    // Simulate breathing with random bubbles every now and then
    if ((api.frameCount + breathingFrameOffset) % rateOfBreathing === 0) {
      let maxBubbles = 3;
      let minIndex = 1;
      let velocity = {
        x: moveableLocation.velocity.x / 2,
        y: api.random(-1, -0.5),
      };

      switch (variant) {
        case "small": {
          maxBubbles = 2;
          minIndex = 2;
          velocity.y = api.random(-0.6, -0.3);
          break;
        }
        case "smallest": {
          maxBubbles = 1;
          minIndex = 3;
          velocity.y = api.random(-0.4, -0.2);
          break;
        }
      }

      const numBubbles = Math.round(api.random(1, maxBubbles));
      for (let i = 0; i < numBubbles; i++) {
        let x = moveableLocation.location.x;
        x += api.random(-size.pixelScale * 2, size.pixelScale * 2);

        let y = moveableLocation.location.y;
        y += api.random(-size.pixelScale * 2, size.pixelScale * 2);

        initBubble({
          layer: fish.layer,
          minIndex,
          position: { x, y },
          velocity,
        });
      }
    }

    moveableLocation.update();

    if (moveableLocation.location.x === minLocation.x) {
      moveableLocation.velocity.x = api.random(-0.04, -0.08);
      moveableLocation.location.x = size.width;

      moveableLocation.location.y = api.random(0, size.height - image.height);
    }

    drawScaledImage({
      api,
      image,
      scale: size.pixelScale,
      translateX: moveableLocation.location.x,
      translateY: moveableLocation.location.y,
    });

    api.pop();
  }, fish.layer);

  return function destroy() {};
}
