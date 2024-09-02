import { assert } from "../assert";

type HexColor = string;
type HSLColor = {
  alpha: number;
  hue: number;
  lightness: number;
  saturation: number;
};
type RGBColor = {
  alpha: number;
  blue: number;
  green: number;
  red: number;
};

export interface Color {
  get hexValue(): HexColor;
  get hslValue(): HSLColor;
  get rgbValue(): RGBColor;
  get value(): string;
}

class ColorImplementation implements Color {
  private hexColor: HexColor | null = null;
  private rgbColor: RGBColor | null = null;

  constructor(value: unknown) {
    if (isHsl(value)) {
      this.rgbColor = hslToRgb(
        value.hue,
        value.saturation,
        value.lightness,
        value.alpha
      );
    } else if (isRgb(value)) {
      this.rgbColor = value;
    } else if (isHex(value)) {
      this.hexColor = value;
    } else {
      throw Error("Invalid color value");
    }
  }

  get hexValue(): HexColor {
    if (this.hexColor !== null) {
      return this.hexColor;
    } else if (this.rgbColor !== null) {
      return rgbToHex(this.rgbColor);
    } else {
      throw Error("Invalid color value");
    }
  }

  get hslValue(): HSLColor {
    if (this.hexColor !== null) {
      return rgbToHsl(hexToRgb(this.hexColor));
    } else if (this.rgbColor !== null) {
      return rgbToHsl(this.rgbColor);
    } else {
      throw Error("Invalid color value");
    }
  }

  get rgbValue(): RGBColor {
    if (this.hexColor !== null) {
      return hexToRgb(this.hexColor);
    } else if (this.rgbColor !== null) {
      return this.rgbColor;
    } else {
      throw Error("Invalid color value");
    }
  }

  get value(): string {
    if (this.hexColor !== null) {
      return this.hexColor;
    } else if (this.rgbColor !== null) {
      if (this.rgbColor.alpha === 1 || this.rgbColor.alpha == null) {
        return `rgb(${this.rgbColor.red}, ${this.rgbColor.green}, ${this.rgbColor.blue})`;
      } else {
        return `rgba(${this.rgbColor.red}, ${this.rgbColor.green}, ${this.rgbColor.blue}, ${this.rgbColor.alpha})`;
      }
    } else {
      throw Error("Invalid color value");
    }
  }
}

export function fromHex(hex: number | string): Color {
  return new ColorImplementation(hex);
}

export function fromHsl(
  hue: number,
  saturation: number,
  lightness: number,
  alpha?: number
): Color;
export function fromHsl(hslColor: Color): Color;
export function fromHsl(...args: any[]): Color {
  if (args.length === 1) {
    return new ColorImplementation(args[0]);
  } else {
    return new ColorImplementation({
      alpha: args[3],
      hue: args[0],
      lightness: args[1],
      saturation: args[2],
    });
  }
}

export function fromRgb(
  red: number,
  green: number,
  blue: number,
  alpha?: number
): Color;
export function fromRgb(rgbColor: RGBColor): Color;
export function fromRgb(...args: any[]): Color {
  if (args.length === 1) {
    return new ColorImplementation(args[0]);
  } else {
    return new ColorImplementation({
      alpha: args[3],
      blue: args[2],
      green: args[1],
      red: args[0],
    });
  }
}

export function isHex(value: any): value is HexColor {
  return (
    (typeof value === "number" && value >= 0) ||
    (typeof value === "string" &&
      value.match(/^#[a-f0-9]{3}([a-f0-9]{3})?$/i) != null)
  );
}

export function isHsl(value: any): value is HSLColor {
  return (
    typeof value === "object" &&
    value != null &&
    value.hasOwnProperty("alpha") &&
    value.hasOwnProperty("blue") &&
    value.hasOwnProperty("green") &&
    value.hasOwnProperty("red")
  );
}

export function isRgb(value: any): value is RGBColor {
  return (
    typeof value === "object" &&
    value != null &&
    value.hasOwnProperty("alpha") &&
    value.hasOwnProperty("blue") &&
    value.hasOwnProperty("green") &&
    value.hasOwnProperty("red")
  );
}

function hexToRgb(hex: string): RGBColor {
  if (/^([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    switch (hex.length) {
      case 3: {
        return {
          alpha: 1,
          blue: parseInt(hex.slice(2), 16),
          green: parseInt(hex.slice(1, 2), 16),
          red: parseInt(hex.slice(0, 1), 16),
        };
      }
      case 6: {
        return {
          alpha: 1,
          blue: parseInt(hex.slice(4), 16),
          green: parseInt(hex.slice(2, 4), 16),
          red: parseInt(hex.slice(0, 2), 16),
        };
      }
    }
  }

  throw Error(`Invalid HEX value "${hex}"`);
}

function hslToRgb(
  hue: number,
  saturation: number,
  lightness: number,
  alpha: number = 1
): RGBColor {
  let red, green, blue;

  if (saturation === 0) {
    red = green = blue = Math.round(lightness * 255); // achromatic
  } else {
    const q =
      lightness < 0.5
        ? lightness * (1 + saturation)
        : lightness + saturation - lightness * saturation;
    const p = 2 * lightness - q;
    red = hueComponentToToRgbComponent(p, q, hue + 1 / 3);
    green = hueComponentToToRgbComponent(p, q, hue);
    blue = hueComponentToToRgbComponent(p, q, hue - 1 / 3);
  }

  return {
    alpha,
    blue,
    green,
    red,
  };
}

function hueComponentToToRgbComponent(p: number, q: number, t: number) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return Math.round(p * 255);
}

function rgbComponentToHexComponent(component: number) {
  const hex = component.toString(16);
  return hex.length == 1 ? `0${hex}` : hex;
}

function rgbToHex(rgb: RGBColor): HexColor {
  return `#${rgbComponentToHexComponent(rgb.red)}${rgbComponentToHexComponent(rgb.green)}${rgbComponentToHexComponent(rgb.blue)}`;
}

function rgbToHsl(rgb: RGBColor): HSLColor {
  let { alpha, red, green, blue } = rgb;

  (red /= 255), (green /= 255), (blue /= 255);
  const vmax = Math.max(red, green, blue),
    vmin = Math.min(red, green, blue);
  let hue,
    saturation,
    lightness = (vmax + vmin) / 2;

  if (vmax === vmin) {
    return { alpha, hue: 0, lightness, saturation: 0 }; // achromatic
  }

  const d = vmax - vmin;
  saturation = lightness > 0.5 ? d / (2 - vmax - vmin) : d / (vmax + vmin);
  if (vmax === red) hue = (green - blue) / d + (green < blue ? 6 : 0);
  if (vmax === green) hue = (blue - red) / d + 2;
  if (vmax === blue) hue = (red - green) / d + 4;

  assert(hue != null, "Hue is undefined");

  hue /= 6;

  return { alpha, hue, lightness, saturation };
}
