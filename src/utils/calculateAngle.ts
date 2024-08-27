export function calculateAngle(
  velocityX: number,
  velocityY: number,
  degreesOffset: number = 0
): number {
  const radians = Math.atan2(velocityY, velocityX);
  const degrees = radians * (180 / Math.PI) + 310 + degreesOffset;

  return degrees % 360;
}
