import * as P5 from "p5";
import { createIrregularSpriteSheet } from "./createIrregularSpriteSheet";

export type Irregular2DSpriteSheet = {
  getSprite: (index: number) => P5.Image;
};

export function createIrregular2DSpriteSheet({
  image: spriteSheetImage,
  spriteWidths,
}: {
  image: P5.Image;
  spriteWidths: number[];
}): Irregular2DSpriteSheet {
  const spriteSheet = createIrregularSpriteSheet({
    image: spriteSheetImage,
  });

  function getSprite(targetIndex: number) {
    let x = 0;
    for (let index = 0; index < targetIndex; index++) {
      x += spriteWidths[index];
    }

    const width = spriteWidths[targetIndex];

    return spriteSheet.getSprite({
      height: spriteSheetImage.height,
      x,
      width,
      y: 0,
    });
  }

  return { getSprite };
}
