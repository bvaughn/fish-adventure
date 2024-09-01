import { Size } from "../../types";
import { createIrregularSpriteSheet } from "./createIrregularSpriteSheet";

export type SpriteSheet = {
  columnCount: number;
  frameCount: number;
  getFrame: (columnIndex: number, rowIndex: number) => Image;
  getRandomFrame: () => Image;
  rowCount: number;
  spriteSize: Size;
};

export function createSpriteSheet({
  image: spriteSheetImage,
  spriteSize,
}: {
  image: P5.Image;
  spriteSize: Size;
}): SpriteSheet {
  const irregularSpriteSheet = createIrregularSpriteSheet({
    image: spriteSheetImage,
  });
  const columnCount = Math.floor(spriteSheetImage.width / spriteSize.width);
  const rowCount = Math.floor(spriteSheetImage.height / spriteSize.height);
  const frameCount = columnCount * rowCount;

  function getFrame(columnIndex: number, rowIndex: number) {
    return irregularSpriteSheet.getSprite({
      height: spriteSize.height,
      x: columnIndex * spriteSize.width,
      width: spriteSize.width,
      y: rowIndex * spriteSize.height,
    });
  }

  function getRandomFrame() {
    const columnIndex = api.random(0, columnCount);
    const rowIndex = api.random(0, rowCount);

    return getFrame(columnIndex, rowIndex);
  }

  return {
    columnCount,
    frameCount,
    getFrame,
    getRandomFrame,
    rowCount,
    spriteSize,
  };
}
