import * as P5 from "p5";
import { api } from "../../p5";
import { Size } from "../../types";

export type SpriteSheet = {
  columnCount: number;
  frameCount: number;
  getFrame: (columnIndex: number, rowIndex: number) => P5.Image;
  getRandomFrame: () => P5.Image;
  rowCount: number;
};

export function createSpriteSheet({
  image: spriteSheetImage,
  spriteSize,
}: {
  image: P5.Image;
  spriteSize: Size;
}): SpriteSheet {
  const columnCount = Math.floor(spriteSheetImage.width / spriteSize.width);
  const rowCount = Math.floor(spriteSheetImage.height / spriteSize.height);
  const frameCount = columnCount * rowCount;

  const frames: P5.Image[] = new Array(frameCount);

  function getFrame(columnIndex: number, rowIndex: number) {
    initializeFrame(columnIndex, rowIndex);

    const index = getIndex(columnIndex, rowIndex);

    return frames[index];
  }

  function getIndex(columnIndex: number, rowIndex: number) {
    return columnIndex + rowIndex * columnCount;
  }

  function getRandomFrame() {
    const columnIndex = api.random(0, columnCount);
    const rowIndex = api.random(0, rowCount);

    return getFrame(columnIndex, rowIndex);
  }

  function initializeFrame(columnIndex: number, rowIndex: number) {
    const index = getIndex(columnIndex, rowIndex);
    if (frames[index] == null) {
      const image = api.createImage(spriteSize.width, spriteSize.height);
      image.copy(
        spriteSheetImage,
        columnIndex * spriteSize.width,
        rowIndex * spriteSize.height,
        spriteSize.width,
        spriteSize.height,
        0,
        0,
        spriteSize.width,
        spriteSize.height
      );

      frames[index] = image;
    }
  }

  return {
    columnCount,
    frameCount,
    getFrame,
    getRandomFrame,
    rowCount,
  };
}
