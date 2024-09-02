import { timeSinceLastFrameMs } from "../scheduler";
import { Velocity } from "../types";

export type MoveableLocation = ReturnType<typeof createMoveableLocation>;

export function createMoveableLocation({
  friction = 0.15,
  initialLocation = { x: 0, y: 0 },
  initialVelocity = { x: 0, y: 0 },
  maxLocation,
  maxVelocity = 1,
  minLocation = { x: 0, y: 0 },
  minVelocity = -1,
  scale = 1,
}: {
  friction?: number;
  initialLocation?: Velocity;
  initialVelocity?: Velocity;
  maxLocation?: Velocity;
  maxVelocity?: number;
  minLocation?: Velocity;
  minVelocity?: number;
  scale?: number;
}) {
  const acceleration = { x: 0, y: 0 };
  const location = initialLocation;
  const velocity = initialVelocity;

  function update() {
    const deltaTimeInSeconds = timeSinceLastFrameMs / 1_000;

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
    location,
    update,
    velocity,
  };
}
