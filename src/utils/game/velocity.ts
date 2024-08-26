import raf from "raf";

// Velocity and acceleration units should be percentages per second
export function createObjectWithVelocity({
  friction = 0,
  minVelocity = -1,
  maxVelocity = 1,
}: {
  friction?: number;
  minVelocity?: number;
  maxVelocity?: number;
} = {}) {
  let acceleration = 0;
  let animationFrameId: number | null = null;
  let velocity = 0;

  function getVelocity(): number {
    return velocity;
  }

  function setAcceleration(value: number) {
    acceleration = value;
  }

  function destroy() {
    if (animationFrameId != null) {
      raf.cancel(animationFrameId);
    }
  }

  function updateVelocity() {
    // TODO Convert acceleration and velocity values to percentages per second
    velocity = Math.max(
      minVelocity,
      Math.min(maxVelocity, (velocity + acceleration) * (1 - friction))
    );

    animationFrameId = raf(updateVelocity);
  }

  animationFrameId = raf(updateVelocity);

  return {
    destroy,
    getVelocity,
    setAcceleration,
  };
}
