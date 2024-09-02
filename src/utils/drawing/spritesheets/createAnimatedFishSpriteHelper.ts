import { registerPreload, registerSetup } from "../../../drawing";
import { Size } from "../../../types";
import { Sprite } from "../Sprites";
import {
  AnimatedSpriteHelper,
  createAnimatedSpriteHelper,
} from "./createAnimatedSpriteHelper";
import { createSpritesFromGrid } from "./createSpritesFromGrid";
import { GridSpriteSheet } from "./types";

export type AnimatedFishSpriteHelper = {
  getSprite(direction: "forward" | "backward", isMoving: boolean): Sprite;
  size: Size;
};

// TODO Add turning-around frame(s)
// TODO Move bubbles logic into this helper?

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

  registerPreload(async () => {
    spriteSheet = createSpritesFromGrid(source, size);
  });

  registerSetup(() => {
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
    getSprite(direction: "forward" | "backward", isMoving: boolean) {
      return direction === "forward"
        ? isMoving
          ? animationHelpers.forward.moving.getFrame()
          : animationHelpers.forward.still.getFrame()
        : isMoving
          ? animationHelpers.backward.moving.getFrame()
          : animationHelpers.backward.still.getFrame();
    },
    get size() {
      return size;
    },
  };
}
