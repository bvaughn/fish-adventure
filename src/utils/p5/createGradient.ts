import P5 from "p5";

export function createGradient(
  api: P5,
  fromColor: P5.Color,
  toColor: P5.Color,
  x: number,
  y: number,
  width: number,
  height: number,
  direction: "down" | "left" | "right" | "up"
) {
  const isHorizontal = direction === "left" || direction === "right";
  const isForward = direction === "right" || direction === "down";

  const size = isHorizontal ? width : height;
  const startIndex = isForward ? (isHorizontal ? x : y) : size;
  const stopIndex = isForward ? startIndex + size : startIndex - size;
  const increment = isForward ? 1 : -1;

  for (
    let index = startIndex;
    isForward ? index < stopIndex : index > stopIndex;
    index += increment
  ) {
    const mappedIndex = api.map(index, 0, size, 0, 1);
    const color = api.lerpColor(
      isForward ? fromColor : toColor,
      isForward ? toColor : fromColor,
      mappedIndex
    );

    api.stroke(color);
    if (isHorizontal) {
      api.line(index, y, index, height);
    } else {
      api.line(x, index, width, index);
    }
  }
}
