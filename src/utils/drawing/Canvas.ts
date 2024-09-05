import { getParallaxOffset } from "../../game/sharedState";
import { Stack } from "../Stack";
import { assert } from "../assert";
import { configureCanvasSizeAndDpi } from "../canvas";
import { Color, fromRgb } from "./Color";
import { Sprite } from "./Sprites";

type Positioning = "normal" | "static";

type DrawingState = {
  fill: Color | null;
  font: string | null;
  positioning: Positioning;
  stroke: Color | null;
};

export type Canvas = {
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
  font: (style: string) => void;
  fill: (color: Color) => void;
  noFill: () => void;
  noStroke: () => void;
  positioning(value: Positioning): void;
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
  drawText: (x: number, y: number, text: string) => void;
  line: (x1: number, y1: number, x2: number, y2: number) => void;
  rect: (x: number, y: number, width: number, height: number) => void;
};

export function createCanvas({
  height: defaultHeight,
  parentElement = document.body,
  width: defaultWidth,
}: {
  height?: number;
  parentElement?: HTMLElement;
  width?: number;
} = {}): Canvas {
  const canvas = document.createElement("canvas");
  const canvasContext = canvas.getContext("2d");
  assert(canvasContext !== null, "Canvas context is null");

  parentElement.appendChild(canvas);

  let height = defaultHeight ?? parentElement.clientHeight;
  let width = defaultWidth ?? parentElement.clientWidth;

  configureCanvasSizeAndDpi(canvas, width, height);

  const drawingStateStack = new Stack<DrawingState>({
    fill: null,
    font: null,
    positioning: "normal",
    stroke: null,
  });

  return {
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
    font(style: string) {
      drawingStateStack.getCurrent().font = style;
    },
    noFill() {
      drawingStateStack.getCurrent().fill = null;
    },
    noStroke() {
      drawingStateStack.getCurrent().stroke = null;
    },
    positioning(value: Positioning) {
      drawingStateStack.getCurrent().positioning = value;
    },
    stroke(color: Color) {
      drawingStateStack.getCurrent().stroke = color;
    },

    // Drawing methods
    clear() {
      // width = Math.round(width);
      // height = Math.round(height);

      canvasContext.clearRect(0, 0, width, height);
    },
    drawSprite(
      sprite: Sprite,
      x: number,
      y: number,
      width: number = sprite.width,
      height: number = sprite.height
    ) {
      const { positioning } = drawingStateStack.getCurrent();

      if (positioning !== "static") {
        x += getParallaxOffset();
      }

      // x = Math.round(x);
      // y = Math.round(y);
      // width = Math.round(width);
      // height = Math.round(height);

      canvasContext.drawImage(sprite, x, y, width, height);
    },
    drawText(x: number, y: number, text: string) {
      const { fill, font, positioning, stroke } =
        drawingStateStack.getCurrent();

      if (positioning !== "static") {
        x += getParallaxOffset();
      }

      // x = Math.round(x);
      // y = Math.round(y);

      if ((fill != null || stroke != null) && font != null) {
        canvasContext.font = font;
        canvasContext.textAlign = "center";
        canvasContext.textBaseline = "middle";
        if (stroke != null) {
          canvasContext.strokeStyle = stroke.value;
          canvasContext.strokeText(text, x, y);
        }
        if (fill != null) {
          canvasContext.fillStyle = fill.value;
          canvasContext.fillText(text, x, y);
        }
      }
    },
    line(x1: number, y1: number, x2: number, y2: number) {
      const { positioning, stroke } = drawingStateStack.getCurrent();

      if (positioning !== "static") {
        x1 += getParallaxOffset();
        x2 += getParallaxOffset();
      }

      // x1 = Math.round(x1);
      // x2 = Math.round(x2);
      // y1 = Math.round(y1);
      // y2 = Math.round(y2);

      if (stroke != null) {
        canvasContext.beginPath();
        canvasContext.moveTo(x1, y1);
        canvasContext.lineTo(x2, y2);
        canvasContext.strokeStyle = stroke.value;
        canvasContext.stroke();
        canvasContext.closePath();
      }
    },
    rect(x: number, y: number, width: number, height: number) {
      const { fill, positioning, stroke } = drawingStateStack.getCurrent();

      if (positioning !== "static") {
        x += getParallaxOffset();
      }

      // x = Math.round(x);
      // y = Math.round(y);
      // width = Math.round(width);
      // height = Math.round(height);

      canvasContext.beginPath();

      if (fill != null) {
        canvasContext.fillStyle = fill.value;
        canvasContext.fillRect(x, y, width, height);
      }

      if (stroke != null) {
        canvasContext.strokeStyle = stroke.value;
        canvasContext.stroke();
      }

      canvasContext.closePath();
    },
  };
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
