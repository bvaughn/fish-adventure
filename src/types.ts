export type Size = {
  height: number;
  width: number;
};

export type Vector = {
  x: number;
  y: number;
};

export type Coordinates = Vector;

export type Rect = Size & Coordinates;
