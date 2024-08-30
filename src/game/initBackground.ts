import { registerDraw, size } from "../p5";
import { createGradient } from "../utils/p5/createGradient";

export function initBackground() {
  registerDraw(function drawBackground(api) {
    createGradient(
      api,
      api.color("#000055"),
      api.color("#000022"),
      0,
      0,
      size.width,
      size.height,
      "down"
    );
  });
}
