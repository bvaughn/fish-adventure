export type Sprite = ImageBitmap;

export async function loadSprites(
  source: string,
  processFunction: (
    width: number,
    height: number,
    addSprite: (
      x: number,
      y: number,
      width: number,
      height: number
    ) => Promise<Sprite>
  ) => void
): Promise<Sprite[]> {
  return new Promise<Sprite[]>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("error", (event) => {
      console.error(event);
      reject(`Failed to load image: ${source}`);
    });
    image.addEventListener("load", async () => {
      const promises: Array<Promise<ImageBitmap>> = [];

      function addSprite(x: number, y: number, width: number, height: number) {
        const promise = createImageBitmap(image, x, y, width, height);
        promises.push(promise);
        return promise;
      }

      processFunction(image.width, image.height, addSprite);

      try {
        const sprites = await Promise.all(promises);

        resolve(sprites);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
    image.src = source;
  });
}
