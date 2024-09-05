export function configureCanvasSizeAndDpi(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
) {
  const dpi = window.devicePixelRatio;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  canvas.width = Math.floor(width * dpi);
  canvas.height = Math.floor(height * dpi);

  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  context.scale(dpi, dpi);
}
