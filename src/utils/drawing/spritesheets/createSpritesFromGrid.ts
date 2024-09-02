import { registerPreload } from "../../../drawing";
import { Size } from "../../../types";
import { assert } from "../../assert";
import { loadSprites, Sprite } from "../Sprites";
import { SpriteSheet } from "./types";

export function createSpritesFromGrid(
  source: string,
  spriteSize: Size
): SpriteSheet {
  let columnCount = 0;
  let rowCount = 0;
  let spriteSheetSize: Size = { width: 0, height: 0 };
  let sprites: Sprite[] = [];

  registerPreload(async () => {
    sprites = await loadSprites(source, (width, height, addSprite) => {
      spriteSheetSize.height = height;
      spriteSheetSize.width = width;

      columnCount = Math.floor(width / spriteSize.width);
      rowCount = Math.floor(height / spriteSize.height);

      for (let y = 0; y < height; y += spriteSize.height) {
        for (let x = 0; x < width; x += spriteSize.width) {
          addSprite(x, y, spriteSize.width, spriteSize.height);
        }
      }
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
