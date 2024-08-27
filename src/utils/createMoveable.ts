// Velocity and acceleration units should be percentages per second
export function createMoveable({
  friction = 0,
  initialPosition = 0,
  initialVelocity = 0,
  maxPosition,
  minPosition,
  maxVelocity,
  minVelocity,
}: {
  friction?: number;
  initialPosition?: number;
  initialVelocity?: number;
  maxPosition?: number;
  minPosition?: number;
  maxVelocity?: number;
  minVelocity?: number;
} = {}) {
  let acceleration = 0;
  let lastTimestamp = 0;
  let position = initialPosition;
  let velocity = initialVelocity;

  function getAcceleration(): number {
    return acceleration;
  }

  function getPosition(): number {
    updateVelocity();

    return position;
  }

  function getVelocity(): number {
    updateVelocity();

    return velocity;
  }

  function setAcceleration(value: number) {
    if (acceleration != 0) {
      // Apply any pending acceleration before setting the new value
      updateVelocity();
    }

    lastTimestamp = performance.now();

    acceleration = value;
  }

  function updateVelocity() {
    const currentTimestamp = performance.now();
    const elapsedTime = currentTimestamp - lastTimestamp;

    lastTimestamp = currentTimestamp;

    if (acceleration !== 0) {
      // Convert acceleration and velocity values to percentages per second
      const accelerationSinceLastFrame = acceleration * (elapsedTime / 1_000);

      velocity += accelerationSinceLastFrame;
    }

    if (friction !== 0) {
      // Convert friction values to percentages per second
      const frictionSinceLastFrame = friction * (elapsedTime / 1_000);

      if (velocity > 0) {
        velocity = Math.max(0, velocity - frictionSinceLastFrame);
      } else if (velocity < 0) {
        velocity = Math.min(0, velocity + frictionSinceLastFrame);
      }
    }

    // Apply optional velocity constraints
    if (maxVelocity != null) {
      velocity = Math.min(maxVelocity, velocity);
    }
    if (minVelocity != null) {
      velocity = Math.max(minVelocity, velocity);
    }

    // Update position
    if (velocity !== 0) {
      // Convert acceleration and velocity values to percentages per second
      const velocitySinceLastFrame = velocity * (elapsedTime / 1_000);

      position += velocitySinceLastFrame;

      // Apply optional position constraints
      if (maxPosition != null) {
        position = Math.min(maxPosition, position);

        if (position === maxPosition) {
          acceleration = 0;
          velocity = 0;
        }
      }
      if (minPosition != null) {
        position = Math.max(minPosition, position);

        if (position === minPosition) {
          acceleration = 0;
          velocity = 0;
        }
      }
    }
  }

  return {
    getAcceleration,
    getPosition,
    getVelocity,
    setAcceleration,
  };
}
