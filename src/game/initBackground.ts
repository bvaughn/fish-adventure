import { registerDraw, size } from "../p5";
import { createGradient } from "../utils/p5/createGradient";

export function initBackground() {
  registerDraw(function drawBackground(api) {
    createGradient({
      api,
      blockSize: size.pixelScale * 10,
      direction: "down",
      fromColor: api.color("#5c63e0"),
      toColor: api.color("#1e25a1"),
      width: size.width,
      x: 0,
      y: 0,
      height: size.height,
    });
  });
}
