// @ts-ignore
import CubicSpline from "cubic-spline";
import { size } from "../p5";
import { createNoise } from "./createNoise";

const noise = createNoise();

export function generateHillData({
  hillSectionPixelSize = 10,
  pixelScale = size.pixelScale,
  splineNoise = 0,
  width = size.width,
}: {
  hillSectionPixelSize?: number;
  pixelScale?: number;
  splineNoise?: number;
  width?: number;
}) {
  noise.updateSeed(Math.random());

  const xs: number[] = [];
  const ys: number[] = [];
  for (let x = 0; x < width; x += hillSectionPixelSize) {
    const perlin = noise.getPerlin2d(x * 0.005, 0);
    const simplex = noise.getSimplex2d(x, 0);
    xs.push(x);
    ys.push((perlin + simplex) / 2);
  }

  const maxIndex = width / pixelScale;
  const spline = new CubicSpline(xs, ys);
  const splinedValues: number[] = [];
  for (let index = 0; index < maxIndex; index++) {
    let indexToUse = index;
    if (splineNoise !== 0) {
      if (Math.random() < splineNoise) {
        const offset = Math.floor(Math.random() * splineNoise);
        const positive = Math.random() < 0.5;

        indexToUse = Math.max(
          0,
          Math.min(
            maxIndex - 1,
            positive ? indexToUse + offset : indexToUse - offset
          )
        );
      }
    }

    splinedValues.push(spline.at(indexToUse));
  }

  return splinedValues;
}
