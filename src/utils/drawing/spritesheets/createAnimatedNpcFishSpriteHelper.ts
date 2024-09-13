import {
  schedulePreloadWork,
  scheduleSetupWork,
} from "../../../scheduling/initialization";
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
  getSpriteIndex(): number;
  size: Size;
  speedFactor: number;
};

export type Variant = 0 | 1 | 2 | 3 | 4 | 4 | 5 | 6 | 7 | 8 | 9;
export const VARIANTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as Variant[];

export const NPC_SPRITE_DIMENSIONS = [
  { x: 1, y: 1, width: 22, height: 9, frames: 2 },
  { x: 1, y: 11, width: 23, height: 24, frames: 2 },
  { x: 1, y: 37, width: 26, height: 12, frames: 2 },
  { x: 1, y: 51, width: 25, height: 20, frames: 2 },
  { x: 1, y: 73, width: 30, height: 12, frames: 2 },
  { x: 1, y: 87, width: 21, height: 17, frames: 2 },
  { x: 1, y: 106, width: 26, height: 16, frames: 2 },
  { x: 1, y: 124, width: 26, height: 18, frames: 2 },
  { x: 1, y: 144, width: 33, height: 20, frames: 2 },

  // Shark
  {
    x: 85,
    y: 1,
    width: 148,
    height: 50,
    frames: 2,
    direction: "vertical",
    speedFactor: 1.5,
  },
];

let animationHelpers: AnimatedSpriteHelper[] = [];
let spriteSheet: SpriteSheet;

export function createAnimatedNpcFishSpriteHelper(variant: Variant) {
  const { speedFactor = 1, height, width } = NPC_SPRITE_DIMENSIONS[variant];

  const animationHelper = animationHelpers[variant];

  return {
    getSprite() {
      return animationHelper.getFrame();
    },
    getSpriteIndex() {
      return animationHelper.getFrameIndex();
    },
    get size() {
      return { height, width };
    },
    get speedFactor() {
      return speedFactor;
    },
  };
}

export function initAnimatedNpcFishSpriteHelper() {
  schedulePreloadWork(() => {
    preloadNpcFishSprites();
  });

  scheduleSetupWork(() => {
    animationHelpers = NPC_SPRITE_DIMENSIONS.map((_, index) =>
      setupNpcFishSprites(index as Variant)
    );
  });
}

export function preloadNpcFishSprites() {
  spriteSheet = createSprites("/images/sprites/npc-fish.gif", (addSprite) => {
    NPC_SPRITE_DIMENSIONS.forEach(
      ({ direction, height, width, x, y, frames }) => {
        for (let frameIndex = 0; frameIndex < frames; frameIndex++) {
          switch (direction) {
            case "vertical": {
              y = y + frameIndex * (height + 1);
              break;
            }
            default: {
              x = x + frameIndex * (width + 1);
              break;
            }
          }

          addSprite(x, y, width, height);
        }
      }
    );
  });

  return spriteSheet;
}

export function setupNpcFishSprites(variant: Variant) {
  const { direction, height, width, x, y, frames } =
    NPC_SPRITE_DIMENSIONS[variant];

  return createAnimatedSpriteHelper({
    frames: new Array(frames)
      .fill(null)
      .map((_, frameIndex) =>
        spriteSheet.getSpriteAtCoordinates(
          direction === "vertical" ? x : x + frameIndex * (width + 1),
          direction === "vertical" ? y + frameIndex * (height + 1) : y
        )
      ),
    framesPerSecond: 3,
  });
}
