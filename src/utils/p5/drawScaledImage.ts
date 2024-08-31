import * as P5 from "p5";
import { api as globalApi, size } from "../../p5";

export function drawScaledImage({
  api = globalApi,
  image,
  scale = size.pixelScale,
  translateX = 0,
  translateY = 0,
}: {
  api?: P5;
  image: P5.Image;
  scale?: number;
  translateX?: number;
  translateY?: number;
}) {
  image.loadPixels();

  api.push();
  api.noStroke();

  const negativeScale = scale < 0;

  scale = Math.abs(scale);

  const xStart = negativeScale ? image.width - 1 : 0;
  const xStop = negativeScale ? 0 : image.width - 1;
  const xIncrement = negativeScale ? -1 : 1;

  for (
    let x = xStart;
    negativeScale ? x >= xStop : x <= xStop;
    x += xIncrement
  ) {
    for (let y = 0; y < image.height; y++) {
      const color = image.get(x, y);

      api.fill(color);
      if (x === xStart) {
      }
      api.rect(translateX + x * scale, translateY + y * scale, scale, scale);
    }
  }

  api.pop();
}
