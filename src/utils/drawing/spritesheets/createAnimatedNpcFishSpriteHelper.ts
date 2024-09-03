import { registerPreload, registerSetup } from "../../../drawing";
import { Size } from "../../../types";
import { Sprite } from "../Sprites";
import {
  AnimatedSpriteHelper,
  createAnimatedSpriteHelper,
} from "./createAnimatedSpriteHelper";
import { createSprites } from "./createSprites";
import { SpriteSheet } from "./types";

export type AnimatedFishSpriteHelper = {
  getSprite(): Sprite;
  size: Size;
};

export type Variant = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const NPC_SPRITE_DIMENSIONS = [
  { x: 1, y: 1, width: 22, height: 9, frames: 2 },
  { x: 1, y: 11, width: 23, height: 24, frames: 2 },
  { x: 1, y: 37, width: 26, height: 12, frames: 2 },
  { x: 1, y: 51, width: 25, height: 20, frames: 2 },
  { x: 1, y: 73, width: 30, height: 12, frames: 2 },
  { x: 1, y: 87, width: 21, height: 17, frames: 2 },
  { x: 1, y: 106, width: 26, height: 16, frames: 2 },
  { x: 1, y: 124, width: 26, height: 18, frames: 2 },
];

let spriteSheet: SpriteSheet;

// TODO Move bubbles logic into a helper?

export function createAnimatedNpcFishSpriteHelper(variant: Variant) {
  const { width, height, x, y, frames } = NPC_SPRITE_DIMENSIONS[variant - 1];

  let animationHelper: AnimatedSpriteHelper;

  registerSetup(() => {
    animationHelper = createAnimatedSpriteHelper({
      frames: new Array(frames)
        .fill(null)
        .map((_, frameIndex) =>
          spriteSheet.getSpriteAtCoordinates(x + frameIndex * (width + 1), y)
        ),
      framesPerSecond: 3,
    });
  });

  return {
    getSprite() {
      return animationHelper.getFrame();
    },
    get size() {
      return { height, width };
    },
  };
}

export function initAnimatedNpcFishSpriteHelper() {
  registerPreload(async () => {
    spriteSheet = createSprites("/images/sprites/npc-fish.gif", (addSprite) => {
      NPC_SPRITE_DIMENSIONS.forEach(({ height, width, x, y, frames }) => {
        for (let frameIndex = 0; frameIndex < frames; frameIndex++) {
          addSprite(x + frameIndex * (width + 1), y, width, height);
        }
      });
    });
  });
}
