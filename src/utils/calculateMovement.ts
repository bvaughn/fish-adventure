export function calculateMovement({
  sizeInPixels,
  timeInMilliseconds,
  velocityPixelsPerSecond,
}: {
  sizeInPixels: number;
  timeInMilliseconds: number;
  velocityPixelsPerSecond: number;
}) {
  return (
    (velocityPixelsPerSecond / sizeInPixels) * (timeInMilliseconds / 1_000)
  );
}
