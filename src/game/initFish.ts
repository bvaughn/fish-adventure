import { api, registerDraw, size } from "../p5";
import { createMoveableLocation } from "../utils/createMoveableLocation";
import { drawScaledImage } from "../utils/p5/drawScaledImage";
import { horizontallyFlipImage } from "../utils/p5/horizontallyFlipImage";
import { initBubble } from "./initBubble";

const PIXELS_PER_SECOND = 2_500;

export function initFish() {
  const frames = [
    api.loadImage("/images/fish-frame-1.svg"),
    api.loadImage("/images/fish-frame-2.svg"),
  ];

  let direction: "front" | "back" = "front";

  const moveableLocation = createMoveableLocation({
    api,
    initialLocation: api.createVector(100, 100),
    maxLocation: api.createVector(size.width, size.height),
    scale: PIXELS_PER_SECOND,
  });

  registerDraw(function drawFish(api) {
    api.push();
    api.noStroke();

    // Cache direct so that the fish doesn't flip back when at rest
    if (moveableLocation.velocity.x < 0) {
      direction = "back";
    } else if (moveableLocation.velocity.x > 0) {
      direction = "front";
    }

    // Swim animation frames (if moving)
    const frameIndex = moveableLocation.velocity.equals(0, 0)
      ? 0
      : api.frameCount % 30 < 15
        ? 0
        : 1;
    let image = frames[frameIndex];

    // Simulate breathing with random bubbles every now and then
    if (api.frameCount % 45 === 0) {
      const numBubbles = Math.round(api.random(1, 3));
      for (let i = 0; i < numBubbles; i++) {
        let x = moveableLocation.location.x;
        x += api.random(-size.pixelScale * 2, size.pixelScale * 2);
        if (direction === "front") {
          x += image.width * size.pixelScale - size.pixelScale;
        }

        let y = moveableLocation.location.y;
        y += api.random(-size.pixelScale * 2, size.pixelScale * 2);

        initBubble(x, y);
      }
    }

    // Reverse direction if moving backwards
    if (direction === "back") {
      image = horizontallyFlipImage({ api: api, image });
    }

    moveableLocation.update();

    drawScaledImage({
      api: api,
      image,
      scale: size.pixelScale,
      translateX: moveableLocation.location.x,
      translateY: moveableLocation.location.y,
    });

    api.pop();
  });

  return function destroy() {
    moveableLocation.destroy();
  };
}
