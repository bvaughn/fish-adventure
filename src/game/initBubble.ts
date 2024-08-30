import * as P5 from "p5";
import { api, registerDraw, size } from "../p5";

const PIXELS_PER_SECOND = 50;

export function initBubble({
  position: partialPosition,
  velocity: partialVelocity,
}: {
  position?: { x?: number; y?: number };
  velocity?: { x?: number; y?: number };
}) {
  let alpha: number = 100;
  let color: P5.Color = api.color(255, 255, 255, alpha);
  let fadeRate: number = api.random(1, 2);
  let position = api.createVector(
    partialPosition?.x ?? api.random(size.width),
    partialPosition?.y ?? api.random(size.height)
  );
  let velocity = api.createVector(
    partialVelocity?.x ?? 0,
    partialVelocity?.y ?? api.random(-1, -0.5)
  );

  const unregister = registerDraw(function drawBubble(api) {
    // TODO Wobble left to right
    const deltaTimeInSeconds = api.deltaTime / 1_000;

    position.add(
      velocity.x * PIXELS_PER_SECOND * deltaTimeInSeconds,
      velocity.y * PIXELS_PER_SECOND * deltaTimeInSeconds
    );

    alpha -= fadeRate;
    color.setAlpha(alpha);

    if (position.y <= 0 || alpha <= 0) {
      unregister();
    }

    api.push();
    api.noStroke();
    api.fill(color);
    api.rect(position.x, position.y, size.pixelScale, size.pixelScale);
    api.pop();
  });
}
