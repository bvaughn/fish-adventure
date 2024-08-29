export function svgElementsToGraphicsCode(svg: SVGElement) {
  let commands: string[] = [];

  const width = parseInt(svg.getAttribute("width") ?? "0");
  const height = parseInt(svg.getAttribute("height") ?? "0");

  commands.push(`api.createGraphics(${width}, ${height});`);
  commands.push(`graphics.noStroke();`);

  svg.childNodes.forEach((node) => {
    if (node instanceof Text) {
      // Unsupported Text node
    } else if (node instanceof SVGElement) {
      switch (node.tagName) {
        case "rect": {
          const rect = node as SVGRectElement;
          const x = parseInt(rect.getAttribute("x") ?? "0");
          const y = parseInt(rect.getAttribute("y") ?? "0");
          const width = parseInt(rect.getAttribute("width") ?? "0");
          const height = parseInt(rect.getAttribute("height") ?? "0");
          const fill = rect.getAttribute("fill") ?? "#000000";

          commands.push(`graphics.fill(api.color("${fill}"));`);
          commands.push(`graphics.rect(${x}, ${y}, ${width}, ${height}`);
          break;
        }
        default: {
          // Unsupported element
        }
      }
    }
  });

  return commands;
}
