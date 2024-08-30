import * as P5 from "p5";
import { api, registerDraw, registerPreload, registerSetup, size } from "../p5";
import { createSpriteSheet, SpriteSheet } from "../utils/p5/createSprite";
import { drawScaledImage } from "../utils/p5/drawScaledImage";

const FRAMES_PER_SECOND = 2;
const PIXELS_PER_SECOND = 50;
const SPRITE_HEIGHT = 4;
const SPRITE_WIDTH = 4;

let image: P5.Image;
let spriteSheet: SpriteSheet;

registerPreload((api) => {
  // Columns: animation left-to-right
  // Rows: random visual styles
  image = api.loadImage("/images/sprites/bubbles.gif");
});

registerSetup(() => {
  spriteSheet = createSpriteSheet({
    image,
    spriteSize: { width: SPRITE_WIDTH, height: SPRITE_HEIGHT },
  });
});

export function initBubble({
  position: partialPosition,
  velocity: partialVelocity,
}: {
  position?: { x?: number; y?: number };
  velocity?: { x?: number; y?: number };
}) {
  let rowIndex = Math.round(api.random(0, 1));
  let startColumnIndex: number = Math.round(api.random(0, 2));
  let startTime: number = performance.now();

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

    const currentTime = performance.now();
    const elapsedTime = currentTime - startTime;

    const columnIndex = Math.floor(
      startColumnIndex + (elapsedTime / 1_000) * FRAMES_PER_SECOND
    );

    if (position.y <= 0 || columnIndex >= spriteSheet.columnCount) {
      unregister();
    }

    image = spriteSheet.getFrame(columnIndex, rowIndex);

    drawScaledImage({
      api,
      image,
      scale: size.pixelScale,
      translateX: position.x,
      translateY: position.y,
    });
  });
}
