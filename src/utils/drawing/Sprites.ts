export type Sprite = ImageBitmap;

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d") as CanvasRenderingContext2D;

export async function loadSprites(
  source: string,
  processFunction: (
    width: number,
    height: number,
    addSprite: (x: number, y: number, width: number, height: number) => void
  ) => void
): Promise<Sprite[]> {
  return new Promise<Sprite[]>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("error", (event) => {
      reject(event.error);
    });
    image.addEventListener("load", async () => {
      context.drawImage(image, 0, 0);

      const promises: Array<Promise<ImageBitmap>> = [];

      function addSprite(x: number, y: number, width: number, height: number) {
        promises.push(createImageBitmap(image, x, y, width, height));
      }

      processFunction(image.width, image.height, addSprite);

      try {
        const sprites = await Promise.all(promises);

        resolve(sprites);
      } catch (error) {
        reject(error);
      }
    });
    image.src = source;
  });
}

// export interface Sprites {
//   height: number;
//   width: number;
//   getSprite: (x: number, y: number, width:number,height:number) => Promise<ImageBitmap>;
// }

// class LoadedSprite implements Sprites {
//   private imageData: ImageData;
//
//   constructor(imageData: ImageData) {
//     this.imageData = imageData;
//   }
//
//   get height() {
//     return this.imageData.height;
//   }
//   get width() {
//     return this.imageData.width;
//   }
//
//   // getPixel(x: number, y: number) {
//   //   const startIndex = (y * this.width + x) * 4;
//   //
//   //   return fromRgb(
//   //     this.imageData.data[startIndex],
//   //     this.imageData.data[startIndex + 1],
//   //     this.imageData.data[startIndex + 2],
//   //     this.imageData.data[startIndex + 3]
//   //   );
//   // }
//
//   async getSprite(x: number, y: number, width: number, height: number) {
//     return createImageBitmap(this.imageData, x,y,width,height)
//   }
// }
