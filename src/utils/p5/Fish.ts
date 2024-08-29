import * as P5 from "p5";
import {
  createMoveableLocation,
  MoveableLocation,
} from "../game/createMoveableLocation";
import { drawScaledImage } from "./drawScaledImage";
import { horizontallyFlipImage } from "./horizontallyFlipImage";
import { Bubble } from "./Bubble";

const WIDTH = 18;
const HEIGHT = 10;
const PIXELS_PER_SECOND = 2_500;

// TODO Fish should emit bubbles every once in a while
// TODO Wiggle tail/fins when moving

export class Fish {
  api: P5;
  bubbles: Set<Bubble> = new Set();
  direction: "front" | "back" = "front";
  fishFrames: P5.Image[];
  fishFrameIndex: number = 0;
  image: P5.Image;
  moveableLocation: MoveableLocation;
  scale: number;
  waterHeight: number;
  waterWidth: number;

  constructor(
    api: P5,
    waterWidth: number,
    waterHeight: number,
    scale: number = 1
  ) {
    this.api = api;
    this.scale = scale;
    this.waterHeight = waterHeight;
    this.waterWidth = waterWidth;

    this.fishFrames = [
      api.loadImage("/images/fish-frame-1.svg"),
      api.loadImage("/images/fish-frame-2.svg"),
    ];

    this.image = api.createImage(WIDTH, HEIGHT);

    this.moveableLocation = createMoveableLocation({
      api,
      maxLocation: api.createVector(
        waterWidth - WIDTH * scale,
        waterHeight - HEIGHT * scale
      ),
      scale: PIXELS_PER_SECOND,
    });
  }

  destroy() {
    this.moveableLocation.destroy();
  }

  draw() {
    this.api.push();
    this.api.noStroke();

    // Emit bubbles every now and then
    if (this.api.frameCount % 45 === 0) {
      const numBubbles = Math.round(this.api.random(1, 3));
      for (let i = 0; i < numBubbles; i++) {
        this.makeBubble();
      }
    }

    const frameIndex = this.moveableLocation.velocity.equals(0, 0)
      ? 0
      : this.api.frameCount % 30 < 15
        ? 0
        : 1;
    let image = this.fishFrames[frameIndex];
    if (this.direction === "back") {
      image = horizontallyFlipImage({ api: this.api, image });
    }

    if (this.moveableLocation.velocity.x < 0) {
      this.direction = "back";
    } else if (this.moveableLocation.velocity.x > 0) {
      this.direction = "front";
    }

    this.moveableLocation.update();

    drawScaledImage({
      api: this.api,
      image,
      scale: this.scale,
      translateX: this.moveableLocation.location.x,
      translateY: this.moveableLocation.location.y,
    });

    this.drawBubbles();
  }

  drawBubbles() {
    this.bubbles.forEach((bubble) => {
      bubble.update();
      bubble.draw();
    });
  }

  makeBubble() {
    const bubble = new Bubble(
      this.api,
      this.scale,
      this.moveableLocation.location.x + WIDTH,
      this.moveableLocation.location.y
    );

    bubble.location.x =
      this.moveableLocation.location.x +
      this.api.random(-this.scale * 2, this.scale * 2);
    if (this.direction === "front") {
      bubble.location.x += WIDTH * this.scale - this.scale;
    }
    bubble.location.y =
      this.moveableLocation.location.y +
      this.api.random(-this.scale * 2, this.scale * 2);
    bubble.onFinished = (bubble) => {
      this.bubbles.delete(bubble);
    };
    this.bubbles.add(bubble);
  }
}
