import { registerPreload } from "../../../drawing";
import { Size } from "../../../types";
import { assert } from "../../assert";
import { loadSprites, Sprite } from "../Sprites";
import { FlatSpriteSheet } from "./types";

export function createSpritesFromSizes(
  source: string,
  spriteWidths: number[]
): FlatSpriteSheet {
  let spriteSheetSize: Size = { width: 0, height: 0 };
  let sprites: Sprite[] = [];

  registerPreload(async () => {
    sprites = await loadSprites(source, (width, height, addSprite) => {
      spriteSheetSize.height = height;
      spriteSheetSize.width = width;

      let x = 0;

      spriteWidths.forEach((spriteWidth) => {
        addSprite(x, 0, spriteWidth, height);

        x += spriteWidth;
      });
    });
  });

  return {
    get sprites() {
      return sprites;
    },
    get spriteSheetSize() {
      return spriteSheetSize;
    },
    getSpriteAtIndex: (index) => {
      const sprite = sprites[index];

      assert(sprite != null, `No sprite found at index ${index}`);

      return sprite;
    },
  };
}
