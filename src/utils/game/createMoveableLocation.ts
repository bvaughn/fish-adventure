import * as P5 from "p5";
import { arrowKeyWatcher } from "../arrowKeyWatcher";

export type MoveableLocation = ReturnType<typeof createMoveableLocation>;

export function createMoveableLocation({
  api,
  friction = 0.15,
  initialLocation = api.createVector(0, 0),
  maxLocation,
  maxVelocity = 1,
  minLocation = api.createVector(0, 0),
  minVelocity = -1,
  rateOfAcceleration = 0.25,
  scale = 1,
}: {
  api: P5;
  friction?: number;
  initialLocation?: P5.Vector;
  maxLocation?: P5.Vector;
  maxVelocity?: number;
  minLocation?: P5.Vector;
  minVelocity?: number;
  rateOfAcceleration?: number;
  scale?: number;
}) {
  const acceleration = api.createVector(0, 0);
  const location = initialLocation;
  const velocity = api.createVector(0, 0);

  const destroy = arrowKeyWatcher((leftRight, upDown) => {
    switch (leftRight) {
      case "left": {
        acceleration.x = -rateOfAcceleration;
        break;
      }
      case "right": {
        acceleration.x = rateOfAcceleration;
        break;
      }
      default: {
        acceleration.x = 0;
        break;
      }
    }

    switch (upDown) {
      case "down": {
        acceleration.y = rateOfAcceleration;
        break;
      }
      case "up": {
        acceleration.y = -rateOfAcceleration;
        break;
      }
      default: {
        acceleration.y = 0;
        break;
      }
    }
  });

  function update() {
    const deltaTime = api.deltaTime;
    const deltaTimeInSeconds = deltaTime / 1_000;

    if (acceleration.x !== 0) {
      velocity.x += acceleration.x * deltaTimeInSeconds;
    }
    if (acceleration.y !== 0) {
      velocity.y += acceleration.y * deltaTimeInSeconds;
    }

    if (friction !== 0) {
      const frictionSinceLastFrame = friction * deltaTimeInSeconds;
      if (velocity.x > 0) {
        velocity.x = Math.max(0, velocity.x - frictionSinceLastFrame);
      } else if (velocity.x < 0) {
        velocity.x = Math.min(0, velocity.x + frictionSinceLastFrame);
      }
      if (velocity.y > 0) {
        velocity.y = Math.max(0, velocity.y - frictionSinceLastFrame);
      } else if (velocity.y < 0) {
        velocity.y = Math.min(0, velocity.y + frictionSinceLastFrame);
      }
    }

    // Apply optional velocity constraints
    if (maxVelocity != null) {
      velocity.x = Math.min(maxVelocity, velocity.x);
      velocity.y = Math.min(maxVelocity, velocity.y);
    }
    if (minVelocity != null) {
      velocity.x = Math.max(minVelocity, velocity.x);
      velocity.y = Math.max(minVelocity, velocity.y);
    }

    // Update position
    if (velocity.x !== 0) {
      // Convert acceleration and velocity values to percentages per second
      location.x += velocity.x * deltaTimeInSeconds * scale;

      // Apply optional position constraints
      if (maxLocation != null) {
        location.x = Math.min(maxLocation.x, location.x);

        if (location.x >= maxLocation.x) {
          if (acceleration.x > 0) {
            acceleration.x = 0;
          }
          velocity.x = 0;
        }
      }
      if (minLocation != null) {
        location.x = Math.max(minLocation.x, location.x);

        if (location.x <= minLocation.x) {
          if (acceleration.x < 0) {
            acceleration.x = 0;
          }
          velocity.x = 0;
        }
      }
    }
    if (velocity.y !== 0) {
      // Convert acceleration and velocity values to percentages per second
      location.y += velocity.y * deltaTimeInSeconds * scale;

      // Apply optional position constraints
      if (maxLocation != null) {
        location.y = Math.min(maxLocation.y, location.y);

        if (location.y >= maxLocation.y) {
          if (acceleration.y > 0) {
            acceleration.y = 0;
          }
          velocity.y = 0;
        }
      }
      if (minLocation != null) {
        location.y = Math.max(minLocation.y, location.y);

        if (location.y <= minLocation.y) {
          if (acceleration.y < 0) {
            acceleration.y = 0;
          }
          acceleration.y = 0;
          velocity.y = 0;
        }
      }
    }
  }

  return {
    acceleration,
    destroy,
    location,
    update,
    velocity,
  };
}
