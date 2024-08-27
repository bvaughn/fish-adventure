import { install, InstalledClock } from "@sinonjs/fake-timers";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createMoveable } from "./createMoveable";

describe("createMoveable", () => {
  let clock: InstalledClock;

  beforeEach(() => {
    clock = install();
  });

  afterEach(() => {
    clock.uninstall();
  });

  test("should accelerate to max velocity and position", () => {
    const velocity = createMoveable({
      friction: 0,
      initialVelocity: 0,
      maxPosition: 5,
      maxVelocity: 1,
    });

    velocity.setAcceleration(0.5);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.00");
    expect(velocity.getPosition().toFixed(2)).toBe("0.00");
    clock.tick(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.25");
    expect(velocity.getPosition().toFixed(2)).toBe("0.13");
    clock.tick(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.50");
    expect(velocity.getPosition().toFixed(2)).toBe("0.38");
    clock.tick(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.75");
    expect(velocity.getPosition().toFixed(2)).toBe("0.75");
    clock.tick(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("1.00");
    expect(velocity.getPosition().toFixed(2)).toBe("1.25");
    clock.tick(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("1.00");
    expect(velocity.getPosition().toFixed(2)).toBe("1.75");
    clock.tick(3_000);
    expect(velocity.getVelocity().toFixed(2)).toBe("1.00");
    expect(velocity.getPosition().toFixed(2)).toBe("4.75");
    clock.tick(1_000);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.00");
    expect(velocity.getPosition().toFixed(2)).toBe("5.00");
  });

  test("should accelerate to min velocity and position", () => {
    const velocity = createMoveable({
      friction: 0,
      initialPosition: 0,
      initialVelocity: 1,
      minPosition: -2,
      minVelocity: -0.5,
    });

    velocity.setAcceleration(-0.5);
    expect(velocity.getVelocity().toFixed(2)).toBe("1.00");
    expect(velocity.getPosition().toFixed(2)).toBe("0.00");
    clock.tick(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.75");
    expect(velocity.getPosition().toFixed(2)).toBe("0.38");
    clock.tick(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.50");
    expect(velocity.getPosition().toFixed(2)).toBe("0.63");
    clock.tick(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.25");
    expect(velocity.getPosition().toFixed(2)).toBe("0.75");
    clock.tick(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.00");
    expect(velocity.getPosition().toFixed(2)).toBe("0.75");
    clock.tick(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("-0.25");
    expect(velocity.getPosition().toFixed(2)).toBe("0.63");
    clock.tick(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("-0.50");
    expect(velocity.getPosition().toFixed(2)).toBe("0.38");
    clock.tick(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("-0.50");
    expect(velocity.getPosition().toFixed(2)).toBe("0.13");
    clock.tick(3_000);
    expect(velocity.getVelocity().toFixed(2)).toBe("-0.50");
    expect(velocity.getPosition().toFixed(2)).toBe("-1.38");
    clock.tick(3_000);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.00");
    expect(velocity.getPosition().toFixed(2)).toBe("-2.00");
  });

  test("should slow down due to friction", () => {
    const velocity = createMoveable({
      friction: 0.1,
      initialVelocity: 1,
      maxVelocity: 1,
      minVelocity: -1,
    });

    expect(velocity.getVelocity().toFixed(2)).toBe("1.00");
    expect(velocity.getPosition().toFixed(2)).toBe("0.00");
    clock.tick(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.95");
    expect(velocity.getPosition().toFixed(2)).toBe("0.47");
    clock.tick(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.90");
    expect(velocity.getPosition().toFixed(2)).toBe("0.92");
    clock.tick(1_000);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.80");
    expect(velocity.getPosition().toFixed(2)).toBe("1.72");
    clock.tick(7_000);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.10");
    expect(velocity.getPosition().toFixed(2)).toBe("2.42");
    clock.tick(1_000);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.00");
    expect(velocity.getPosition().toFixed(2)).toBe("2.42");
    clock.tick(5_000);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.00");
    expect(velocity.getPosition().toFixed(2)).toBe("2.42");
  });

  test("should slow down due to friction with a negative velocity", () => {
    const velocity = createMoveable({
      friction: 0.1,
      initialVelocity: -1,
      maxVelocity: 1,
      minVelocity: -1,
    });

    expect(velocity.getVelocity().toFixed(2)).toBe("-1.00");
    expect(velocity.getPosition().toFixed(2)).toBe("0.00");
    clock.tick(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("-0.95");
    expect(velocity.getPosition().toFixed(2)).toBe("-0.47");
    clock.tick(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("-0.90");
    expect(velocity.getPosition().toFixed(2)).toBe("-0.92");
    clock.tick(1_000);
    expect(velocity.getVelocity().toFixed(2)).toBe("-0.80");
    expect(velocity.getPosition().toFixed(2)).toBe("-1.72");
    clock.tick(7_000);
    expect(velocity.getVelocity().toFixed(2)).toBe("-0.10");
    expect(velocity.getPosition().toFixed(2)).toBe("-2.42");
    clock.tick(1_000);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.00");
    expect(velocity.getPosition().toFixed(2)).toBe("-2.42");
    clock.tick(5_000);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.00");
    expect(velocity.getPosition().toFixed(2)).toBe("-2.42");
  });

  test("should apply pending accelerate changes when changing acceleration", () => {
    const velocity = createMoveable({
      friction: 0,
      initialVelocity: 0,
      maxVelocity: 1,
      minVelocity: -1,
    });

    velocity.setAcceleration(0.5);
    clock.tick(500);
    velocity.setAcceleration(1);
    clock.tick(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.75");
    expect(velocity.getPosition().toFixed(2)).toBe("0.50");
  });
});
