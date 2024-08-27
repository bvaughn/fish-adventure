import { describe, expect, test } from "vitest";
import { calculateAngle } from "./calculateAngle";

describe("calculateAngle", () => {
  test("should work", () => {
    expect(calculateAngle(1, 0)).toEqual(310);
    expect(calculateAngle(-1, 0)).toEqual(130);
    expect(calculateAngle(0, -1)).toEqual(220);
    expect(calculateAngle(0, 1)).toEqual(40);
  });

  test("should support an offset degrees parameter", () => {
    expect(calculateAngle(1, 0, 90)).toEqual(40);
    expect(calculateAngle(-1, 0, 90)).toEqual(220);
    expect(calculateAngle(0, -1, 90)).toEqual(310);
    expect(calculateAngle(0, 1, 90)).toEqual(130);
  });
});
