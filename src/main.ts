import P5 from "p5";
import { createGradient } from "./utils/p5/createGradient";
import { Fish } from "./utils/p5/Fish";

new P5((api: P5) => {
  const canvasWidth = Math.min(600, api.windowWidth);
  const canvasHeight = Math.min(300, api.windowHeight);

  const SCALE = 5;

  const fish = new Fish(api, canvasWidth, canvasHeight, SCALE);
  fish.moveableLocation.location.x = 100;
  fish.moveableLocation.location.y = 100;

  api.setup = () => {
    api.frameRate(30);
    api.createCanvas(canvasWidth, canvasHeight);
    api.noStroke();
  };

  api.draw = () => {
    api.clear();

    createGradient(
      api,
      api.color("#000055"),
      api.color("#000022"),
      0,
      0,
      canvasWidth,
      canvasHeight,
      "down"
    );

    fish.draw();
  };
}, document.body);
