import { install, InstalledClock } from "@sinonjs/fake-timers";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import {
  reset,
  runScheduler_forTestingOnly,
  timestamp,
} from "../scheduling/scheduler";
import { createMoveable } from "./createMoveable";

describe("createMoveable", () => {
  let clock: InstalledClock;

  beforeEach(() => {
    clock = install();

    // Moveable is scheduler-based (so that it supports pause and resume)
    reset();
  });

  afterEach(() => {
    clock.uninstall();
  });

  function updateScheduler(elapsedTime: number) {
    clock.tick(elapsedTime);

    runScheduler_forTestingOnly(timestamp + elapsedTime);
  }

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
    updateScheduler(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.25");
    expect(velocity.getPosition().toFixed(2)).toBe("0.13");
    updateScheduler(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.50");
    expect(velocity.getPosition().toFixed(2)).toBe("0.38");
    updateScheduler(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.75");
    expect(velocity.getPosition().toFixed(2)).toBe("0.75");
    updateScheduler(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("1.00");
    expect(velocity.getPosition().toFixed(2)).toBe("1.25");
    updateScheduler(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("1.00");
    expect(velocity.getPosition().toFixed(2)).toBe("1.75");
    updateScheduler(3_000);
    expect(velocity.getVelocity().toFixed(2)).toBe("1.00");
    expect(velocity.getPosition().toFixed(2)).toBe("4.75");
    updateScheduler(1_000);
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
    updateScheduler(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.75");
    expect(velocity.getPosition().toFixed(2)).toBe("0.38");
    updateScheduler(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.50");
    expect(velocity.getPosition().toFixed(2)).toBe("0.63");
    updateScheduler(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.25");
    expect(velocity.getPosition().toFixed(2)).toBe("0.75");
    updateScheduler(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.00");
    expect(velocity.getPosition().toFixed(2)).toBe("0.75");
    updateScheduler(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("-0.25");
    expect(velocity.getPosition().toFixed(2)).toBe("0.63");
    updateScheduler(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("-0.50");
    expect(velocity.getPosition().toFixed(2)).toBe("0.38");
    updateScheduler(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("-0.50");
    expect(velocity.getPosition().toFixed(2)).toBe("0.13");
    updateScheduler(3_000);
    expect(velocity.getVelocity().toFixed(2)).toBe("-0.50");
    expect(velocity.getPosition().toFixed(2)).toBe("-1.38");
    updateScheduler(3_000);
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
    updateScheduler(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.95");
    expect(velocity.getPosition().toFixed(2)).toBe("0.47");
    updateScheduler(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.90");
    expect(velocity.getPosition().toFixed(2)).toBe("0.92");
    updateScheduler(1_000);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.80");
    expect(velocity.getPosition().toFixed(2)).toBe("1.72");
    updateScheduler(7_000);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.10");
    expect(velocity.getPosition().toFixed(2)).toBe("2.42");
    updateScheduler(1_000);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.00");
    expect(velocity.getPosition().toFixed(2)).toBe("2.42");
    updateScheduler(5_000);
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
    updateScheduler(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("-0.95");
    expect(velocity.getPosition().toFixed(2)).toBe("-0.47");
    updateScheduler(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("-0.90");
    expect(velocity.getPosition().toFixed(2)).toBe("-0.92");
    updateScheduler(1_000);
    expect(velocity.getVelocity().toFixed(2)).toBe("-0.80");
    expect(velocity.getPosition().toFixed(2)).toBe("-1.72");
    updateScheduler(7_000);
    expect(velocity.getVelocity().toFixed(2)).toBe("-0.10");
    expect(velocity.getPosition().toFixed(2)).toBe("-2.42");
    updateScheduler(1_000);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.00");
    expect(velocity.getPosition().toFixed(2)).toBe("-2.42");
    updateScheduler(5_000);
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
    updateScheduler(500);
    velocity.setAcceleration(1);
    updateScheduler(500);
    expect(velocity.getVelocity().toFixed(2)).toBe("0.75");
    expect(velocity.getPosition().toFixed(2)).toBe("0.50");
  });
});
