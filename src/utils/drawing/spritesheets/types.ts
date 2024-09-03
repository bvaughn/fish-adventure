import { Size } from "../../../types";
import { Sprite } from "../Sprites";

export type BaseSpriteSheet = {
  sprites: Sprite[];
  spriteSheetSize: Size;
};

export type SpriteSheet = BaseSpriteSheet & {
  getSpriteAtCoordinates: (x: number, y: number) => Sprite;
};

export type FlatSpriteSheet = BaseSpriteSheet & {
  getSpriteAtIndex: (index: number) => Sprite;
};

export type GridSpriteSheet = BaseSpriteSheet & {
  columnCount: number;
  getSpriteInCell: (columnIndex: number, rowIndex: number) => Sprite;
  rowCount: number;
  spriteSize: Size;
};
