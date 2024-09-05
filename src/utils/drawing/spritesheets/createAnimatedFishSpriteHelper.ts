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

const FPS_RESTING = 2;
const FPS_SWIMMING = 3;
const FPS_TURNING = 15;

export type AnimatedFishSpriteHelper = {
  getSprite(direction: "forward" | "backward", isMoving: boolean): Sprite;
  size: Size;
  spriteSheet: GridSpriteSheet;
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
      turnForward: AnimatedSpriteHelper;
    };
    forward: {
      moving: AnimatedSpriteHelper;
      still: AnimatedSpriteHelper;
      turnBackward: AnimatedSpriteHelper;
    };
  };
  let prevDirection: "forward" | "backward" | null = null;
  let spriteSheet: GridSpriteSheet;
  let turningState: "turning-forward" | "turning-backward" | null = null;

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
          framesPerSecond: FPS_SWIMMING,
        }),
        still: createAnimatedSpriteHelper({
          frames: [
            spriteSheet.getSpriteInCell(0, 1),
            spriteSheet.getSpriteInCell(1, 1),
          ],
          framesPerSecond: FPS_RESTING,
        }),
        turnForward: createAnimatedSpriteHelper({
          frames: [
            spriteSheet.getSpriteInCell(4, 1),
            spriteSheet.getSpriteInCell(5, 1),
            spriteSheet.getSpriteInCell(6, 1),
            spriteSheet.getSpriteInCell(7, 1),
          ],
          framesPerSecond: FPS_TURNING,
          loop: false,
        }),
      },
      forward: {
        moving: createAnimatedSpriteHelper({
          frames: [
            spriteSheet.getSpriteInCell(2, 0),
            spriteSheet.getSpriteInCell(3, 0),
          ],
          framesPerSecond: FPS_SWIMMING,
        }),
        still: createAnimatedSpriteHelper({
          frames: [
            spriteSheet.getSpriteInCell(0, 0),
            spriteSheet.getSpriteInCell(1, 0),
          ],
          framesPerSecond: FPS_RESTING,
        }),
        turnBackward: createAnimatedSpriteHelper({
          frames: [
            spriteSheet.getSpriteInCell(4, 0),
            spriteSheet.getSpriteInCell(5, 0),
            spriteSheet.getSpriteInCell(6, 0),
            spriteSheet.getSpriteInCell(7, 0),
          ],
          framesPerSecond: FPS_TURNING,
          loop: false,
        }),
      },
    };
  });

  return {
    getSprite(direction: "forward" | "backward", isMoving: boolean): Sprite {
      if (direction !== prevDirection) {
        switch (prevDirection) {
          case "backward": {
            turningState = "turning-forward";
            break;
          }
          case "forward": {
            turningState = "turning-backward";
            break;
          }
        }
      }

      prevDirection = direction;

      if (turningState) {
        const sprite =
          turningState === "turning-forward"
            ? animationHelpers.backward.turnForward.getFrame()
            : animationHelpers.forward.turnBackward.getFrame();
        if (sprite) {
          return sprite;
        }

        turningState = null;

        animationHelpers.backward.turnForward.reset();
        animationHelpers.forward.turnBackward.reset();
      }

      if (direction === "forward") {
        if (isMoving) {
          return animationHelpers.forward.moving.getFrame();
        } else {
          return animationHelpers.forward.still.getFrame();
        }
      } else {
        if (isMoving) {
          return animationHelpers.backward.moving.getFrame();
        } else {
          return animationHelpers.backward.still.getFrame();
        }
      }
    },
    get size() {
      return size;
    },
    get spriteSheet() {
      return spriteSheet;
    },
  };
}
