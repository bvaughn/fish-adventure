import { PIXEL_SCALE } from "../constants";
import { FOREGROUND_LAYER, registerDraw, registerSetup } from "../drawing";
import { fromHex } from "../utils/drawing/Color";
import { generateHillData } from "../utils/generateHillData";

const TEXTURE_HEIGHT = 5;

export function initForeground() {
  let textureValues: number[] = [];

  registerSetup(() => {
    textureValues = generateHillData({
      hillSectionPixelSize: 5,
      splineNoise: 2,

      // TODO Scrollable map width (lazily generated?)
      width: window.outerWidth,
    });
  });

  registerDraw((data, canvas) => {
    // Draw small foreground hills
    canvas.fill(fromHex("#000d13"));

    textureValues.forEach((value, index) => {
      const x = index * PIXEL_SCALE;
      const y = canvas.height - value * TEXTURE_HEIGHT * PIXEL_SCALE;

      canvas.rect(x, y, PIXEL_SCALE, canvas.height - y);
    });
  }, FOREGROUND_LAYER);
}
