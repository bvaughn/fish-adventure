export type Rgb = {
  blue: number;
  green: number;
  red: number;
};

export type Hex = string;

export function getGradientHexColor(
  percentage: number,
  colorOne: Hex | Rgb,
  colorTwo: Hex | Rgb
): string {
  if (isHex(colorOne)) {
    colorOne = hexToRgbA(colorOne);
  }
  if (isHex(colorTwo)) {
    colorTwo = hexToRgbA(colorTwo);
  }

  const red = colorOne.red + percentage * (colorTwo.red - colorOne.red);
  const green = colorOne.green + percentage * (colorTwo.green - colorOne.green);
  const blue = colorOne.blue + percentage * (colorTwo.blue - colorOne.blue);

  return rgbToHex({
    red: Math.round(red),
    green: Math.round(green),
    blue: Math.round(blue),
  });
}

export function hexToRgbA(hex: string): Rgb {
  if (isHex(hex)) {
    if (hex.startsWith("#")) {
      hex = hex.slice(1);
    }

    if (/^([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      switch (hex.length) {
        case 3: {
          return {
            blue: parseInt(hex.slice(2), 16),
            green: parseInt(hex.slice(1, 2), 16),
            red: parseInt(hex.slice(0, 1), 16),
          };
        }
        case 6: {
          return {
            blue: parseInt(hex.slice(4), 16),
            green: parseInt(hex.slice(2, 4), 16),
            red: parseInt(hex.slice(0, 2), 16),
          };
        }
      }
    }
  }

  throw Error(`Invalid HEX value "${hex}"`);
}

export function isHex(value: any): value is Hex {
  return typeof value === "string" && /^#*([A-Fa-f0-9]{3}){1,2}$/.test(value);
}

export function isRgb(value: any): value is Rgb {
  return (
    typeof value === "object" &&
    value != null &&
    value.hasOwnProperty("red") &&
    value.hasOwnProperty("green") &&
    value.hasOwnProperty("blue")
  );
}

function rgbComponentToHexComponent(component: number) {
  const hex = component.toString(16);
  return hex.length == 1 ? `0${hex}` : hex;
}

export function rgbToHex(rgb: Rgb): Hex {
  if (isRgb(rgb)) {
    return `#${rgbComponentToHexComponent(rgb.red)}${rgbComponentToHexComponent(rgb.green)}${rgbComponentToHexComponent(rgb.blue)}`;
  }

  throw Error("Invalid RBG value");
}
