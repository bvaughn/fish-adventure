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
import { createSpritesFromGrid } from "./createSpritesFromGrid";
import { GridSpriteSheet } from "./types";

export type AnimatedFishSpriteHelper = {
  getSprite(
    direction: "forward" | "backward",
    isMoving: boolean,
    isTurning: boolean
  ): Sprite;
  size: Size;
};

export function createAnimatedFishSpriteHelper({
  source,
  size,
}: {
  source: string;
  size: Size;
}) {
  let animationHelpers: {
    backward: {
      moving: AnimatedSpriteHelper;
      still: AnimatedSpriteHelper;
    };
    forward: {
      moving: AnimatedSpriteHelper;
      still: AnimatedSpriteHelper;
    };
  };
  let spriteSheet: GridSpriteSheet;

  schedulePreloadWork(async () => {
    spriteSheet = createSpritesFromGrid(source, size);
  });

  scheduleSetupWork(() => {
    let forwardFrames: Sprite[] = [];
    for (
      let columnIndex = 0;
      columnIndex < spriteSheet.columnCount;
      columnIndex++
    ) {
      forwardFrames.push(spriteSheet.getSpriteInCell(columnIndex, 0));
    }

    animationHelpers = {
      backward: {
        moving: createAnimatedSpriteHelper({
          frames: [
            spriteSheet.getSpriteInCell(2, 1),
            spriteSheet.getSpriteInCell(3, 1),
          ],
          framesPerSecond: 3,
        }),
        still: createAnimatedSpriteHelper({
          frames: [
            spriteSheet.getSpriteInCell(0, 1),
            spriteSheet.getSpriteInCell(1, 1),
          ],
          framesPerSecond: 2,
        }),
      },
      forward: {
        moving: createAnimatedSpriteHelper({
          frames: [
            spriteSheet.getSpriteInCell(2, 0),
            spriteSheet.getSpriteInCell(3, 0),
          ],
          framesPerSecond: 3,
        }),
        still: createAnimatedSpriteHelper({
          frames: [
            spriteSheet.getSpriteInCell(0, 0),
            spriteSheet.getSpriteInCell(1, 0),
          ],
          framesPerSecond: 2,
        }),
      },
    };
  });

  return {
    getSprite(
      direction: "forward" | "backward",
      isMoving: boolean,
      isTurning: boolean
    ): Sprite {
      if (direction === "forward") {
        if (isMoving) {
          if (isTurning) {
            return spriteSheet.getSpriteInCell(4, 1);
          } else {
            return animationHelpers.forward.moving.getFrame();
          }
        } else {
          return animationHelpers.forward.still.getFrame();
        }
      } else {
        if (isMoving) {
          if (isTurning) {
            return spriteSheet.getSpriteInCell(4, 0);
          } else {
            return animationHelpers.backward.moving.getFrame();
          }
        } else {
          return animationHelpers.backward.still.getFrame();
        }
      }
    },
    get size() {
      return size;
    },
  };
}
