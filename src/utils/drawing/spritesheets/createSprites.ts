import { registerPreload } from "../../../drawing";
import { Size } from "../../../types";
import { assert } from "../../assert";
import { loadSprites, Sprite } from "../Sprites";
import { SpriteSheet } from "./types";

export function createSprites(
  source: string,
  loader: (
    addSprite: (x: number, y: number, width: number, height: number) => void
  ) => void
): SpriteSheet {
  let spriteSheetSize: Size = { width: 0, height: 0 };
  let sprites: Sprite[];
  let spriteMap: Map<string, Sprite> = new Map();

  const getKey = (x: number, y: number) => `${x},${y}`;

  registerPreload(async () => {
    sprites = await loadSprites(source, (width, height, addSprite) => {
      spriteSheetSize.height = height;
      spriteSheetSize.width = width;

      loader((x: number, y: number, width: number, height: number) => {
        addSprite(x, y, width, height).then((sprite) => {
          spriteMap.set(getKey(x, y), sprite);
        });
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
    getSpriteAtCoordinates: (x: number, y: number) => {
      const key = getKey(x, y);
      const sprite = spriteMap.get(key);

      assert(sprite != null, `Sprite not found at coordinates ${x}, ${y}`);

      return sprite;
    },
  };
}
