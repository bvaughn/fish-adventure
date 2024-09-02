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
  getSprite(direction: "forward" | "backward"): Sprite;
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
  let backwardAnimatedSprite: AnimatedSpriteHelper;
  let forwardAnimatedSprite: AnimatedSpriteHelper;
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

    forwardAnimatedSprite = createAnimatedSpriteHelper({
      frames: forwardFrames,
      framesPerSecond: 2,
    });

    let backwardFrames: Sprite[] = [];
    for (
      let columnIndex = 0;
      columnIndex < spriteSheet.columnCount;
      columnIndex++
    ) {
      backwardFrames.push(spriteSheet.getSpriteInCell(columnIndex, 1));
    }
    backwardAnimatedSprite = createAnimatedSpriteHelper({
      frames: backwardFrames,
      framesPerSecond: 2,
    });
  });

  return {
    getSprite(direction: "forward" | "backward") {
      return direction === "forward"
        ? forwardAnimatedSprite.getFrame()
        : backwardAnimatedSprite.getFrame();
    },
    get size() {
      return size;
    },
  };
}
