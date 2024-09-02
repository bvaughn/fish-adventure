import { Size } from "../../../types";
import { Sprite } from "../Sprites";

export type SpriteSheet = {
  columnCount: number;
  rowCount: number;
  sprites: Sprite[];
  spriteSheetSize: Size;
  getSprite: (columnIndex: number, rowIndex: number) => Sprite;
};
