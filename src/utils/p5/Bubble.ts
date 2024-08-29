import * as P5 from "p5";

const PIXELS_PER_SECOND = 50;

export class Bubble {
  alpha: number = 1;
  api: P5;
  color: P5.Color;
  fadeRate: number;
  location: P5.Vector;
  onFinished?: (bubble: Bubble) => void;
  size: number;
  velocity: P5.Vector;
  waterWidth: number;
  waterHeight: number;

  constructor(api: P5, size: number, waterWidth: number, waterHeight: number) {
    this.alpha = api.random(50, 100);
    this.api = api;
    this.color = api.color(255, 255, 255, this.alpha);
    this.location = api.createVector();
    this.fadeRate = api.random(1, 2);
    this.size = size;
    this.velocity = api.createVector(0, api.random(-1, -0.5));

    this.waterHeight = waterHeight;
    this.waterWidth = waterWidth;
  }

  public draw() {
    const api = this.api;
    api.push();
    api.noStroke();
    api.fill(this.color);
    api.rect(this.location.x, this.location.y, this.size, this.size);
    api.pop();
  }

  public randomizeLocation() {
    this.location.x = this.api.random(this.waterWidth);
    this.location.y = this.api.random(this.waterHeight);
  }

  public update() {
    // TODO Wobble left to right

    const deltaTimeInSeconds = this.api.deltaTime / 1_000;

    this.location.add(
      0,
      this.velocity.y * PIXELS_PER_SECOND * deltaTimeInSeconds
    );

    this.alpha -= this.fadeRate;
    this.color.setAlpha(this.alpha);

    if (this.location.y <= 0 || this.alpha <= 0) {
      // this.initialize(true);
      if (this.onFinished) {
        this.onFinished(this);
      }
    }
  }
}
