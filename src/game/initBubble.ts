import * as P5 from "p5";
import { api, registerDraw, size } from "../p5";

const PIXELS_PER_SECOND = 50;

export function initBubble(
  x: number = api.random(size.width),
  y: number = api.random(size.height)
) {
  let alpha: number = 100;
  let color: P5.Color = api.color(255, 255, 255, alpha);
  let fadeRate: number = api.random(1, 2);
  let location: P5.Vector = api.createVector(x, y);
  let velocity: P5.Vector = api.createVector(0, api.random(-1, -0.5));

  const unregister = registerDraw(function drawBubble(api) {
    // TODO Wobble left to right
    const deltaTimeInSeconds = api.deltaTime / 1_000;

    location.add(0, velocity.y * PIXELS_PER_SECOND * deltaTimeInSeconds);

    alpha -= fadeRate;
    color.setAlpha(alpha);

    if (location.y <= 0 || alpha <= 0) {
      unregister();
    }

    api.push();
    api.noStroke();
    api.fill(color);
    api.rect(location.x, location.y, size.pixelScale, size.pixelScale);
    api.pop();
  });
}
