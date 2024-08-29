import * as P5 from "p5";

export function horizontallyFlipImage({
  api,
  image,
}: {
  api: P5;
  image: P5.Image;
}) {
  const { height, width } = image;

  const clonedImage = api.createImage(width, height);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      clonedImage.set(width - x - 1, y, image.get(x, y));
    }
  }
  clonedImage.updatePixels();

  return clonedImage;
}
