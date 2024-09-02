import { registerPreload } from "../../../drawing";
import { Size } from "../../../types";
import { assert } from "../../assert";
import { loadSprites, Sprite } from "../Sprites";
import { SpriteSheet } from "./types";

export function createSpritesFromSizes(
  source: string,
  spriteWidths: number[]
): SpriteSheet {
  let columnCount = 0;
  let rowCount = 0;
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
    get columnCount() {
      return columnCount;
    },
    get rowCount() {
      return rowCount;
    },
    get sprites() {
      return sprites;
    },
    get spriteSheetSize() {
      return spriteSheetSize;
    },
    getSprite: (columnIndex: number, rowIndex: number) => {
      const index = columnIndex + rowIndex * columnCount;
      const sprite = sprites[index];

      assert(
        sprite != null,
        `Sprite not found at column ${columnIndex} and row ${rowIndex}`
      );

      return sprite;
    },
  };
}
