import * as P5 from "p5";
import { api } from "../../p5";

export type IrregularSpriteSheet = {
  getSprite: ({
    height,
    x,
    width,
    y,
  }: {
    height: number;
    x: number;
    width: number;
    y: number;
  }) => P5.Image;
};

export function createIrregularSpriteSheet({
  image: spriteSheetImage,
}: {
  image: P5.Image;
}): IrregularSpriteSheet {
  const sprites: Map<string, P5.Image> = new Map();

  function getSprite({
    height,
    x,
    width,
    y,
  }: {
    height: number;
    x: number;
    width: number;
    y: number;
  }) {
    const key = `${x}.${y}.${width}.${height}`;
    if (!sprites.has(key)) {
      const image = api.createImage(width, height);
      image.copy(spriteSheetImage, x, y, width, height, 0, 0, width, height);

      sprites.set(key, image);
    }

    return sprites.get(key) as P5.Image;
  }

  return {
    getSprite,
  };
}
