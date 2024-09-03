import { FRAME_RATE } from "../../constants";
import { Stack } from "../Stack";
import { assert } from "../assert";
import { Color, fromRgb } from "./Color";
import { Sprite } from "./Sprites";

type DrawingState = {
  fill: Color | null;
  stroke: Color | null;
};

export type Canvas = {
  frameRate: (fps: number) => void;
  popDrawingState: () => void;
  pushDrawingState: () => void;
  resize: (width: number, height: number) => void;

  // Utility methods
  lerp: (from: number, to: number, amount: number) => number;
  lerpColor: (from: Color, to: Color, amount: number) => Color;
  random: (min: number, max: number) => number;

  // State
  height: number;
  width: number;

  // Modifiers
  fill: (color: Color) => void;
  noFill: () => void;
  noStroke: () => void;
  stroke: (color: Color) => void;

  // Drawing methods
  clear: () => void;
  drawSprite: (
    sprite: Sprite,
    x: number,
    y: number,
    width?: number,
    height?: number
  ) => void;
  line: (x1: number, y1: number, x2: number, y2: number) => void;
  rect: (x: number, y: number, width: number, height: number) => void;
};

export const offscreenCanvas = document.createElement("canvas");
export const offscreenContext = offscreenCanvas.getContext(
  "2d"
) as CanvasRenderingContext2D;

configureCanvasSizeAndDpi(offscreenCanvas, 800, 600);

export function createCanvas({
  frameRate = FRAME_RATE,
  height: defaultHeight,
  parentElement = document.body,
  width: defaultWidth,
}: {
  frameRate?: number;
  height?: number;
  parentElement?: HTMLElement;
  width?: number;
} = {}): Canvas {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  assert(context !== null, "Canvas context is null");

  parentElement.appendChild(canvas);

  let height = defaultHeight ?? parentElement.clientHeight;
  let width = defaultWidth ?? parentElement.clientWidth;

  configureCanvasSizeAndDpi(canvas, width, height);

  const drawingStateStack = new Stack<DrawingState>({
    fill: null,
    stroke: null,
  });

  return {
    frameRate(fps: number) {
      frameRate = fps;
    },
    popDrawingState() {
      drawingStateStack.pop();
    },
    pushDrawingState() {
      drawingStateStack.push();
    },
    resize(newWidth: number, newHeight: number) {
      height = newHeight;
      width = newWidth;

      configureCanvasSizeAndDpi(canvas, width, height);
    },

    // Utility methods
    lerp,
    lerpColor,
    random,

    // State
    get height() {
      return height;
    },
    get width() {
      return width;
    },

    // Modifiers
    fill(color: Color) {
      drawingStateStack.getCurrent().fill = color;
    },
    noFill() {
      drawingStateStack.getCurrent().fill = null;
    },
    noStroke() {
      drawingStateStack.getCurrent().stroke = null;
    },
    stroke(color: Color) {
      drawingStateStack.getCurrent().stroke = color;
    },

    // Drawing methods
    clear() {
      context.clearRect(0, 0, width, height);
    },
    drawSprite(
      sprite: Sprite,
      x: number,
      y: number,
      width?: number,
      height?: number
    ) {
      context.drawImage(
        sprite,
        x,
        y,
        width ?? sprite.width,
        height ?? sprite.height
      );
    },
    line(x1: number, y1: number, x2: number, y2: number) {
      const { stroke } = drawingStateStack.getCurrent();

      if (stroke != null) {
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.strokeStyle = stroke.value;
        context.stroke();
      }
    },
    rect(x: number, y: number, width: number, height: number) {
      const { fill, stroke } = drawingStateStack.getCurrent();

      context.beginPath();

      if (fill != null) {
        context.fillStyle = fill.value;
        context.fillRect(x, y, width, height);
      }

      if (stroke != null) {
        context.strokeStyle = stroke.value;
        context.stroke();
      }
    },
  };
}

function configureCanvasSizeAndDpi(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
) {
  const dpi = window.devicePixelRatio;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  canvas.width = Math.floor(width * dpi);
  canvas.height = Math.floor(height * dpi);

  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  context.scale(dpi, dpi);
}

function lerpColor(from: Color, to: Color, amount: number): Color {
  const rgbFrom = from.rgbValue;
  const rgbTo = to.rgbValue;

  return fromRgb({
    alpha: lerp(rgbFrom.alpha, rgbTo.alpha, amount),
    blue: lerp(rgbFrom.blue, rgbTo.blue, amount),
    green: lerp(rgbFrom.green, rgbTo.green, amount),
    red: lerp(rgbFrom.red, rgbTo.red, amount),
  });
}

function lerp(from: number, to: number, amount: number) {
  return (1 - amount) * from + amount * to;
}

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
