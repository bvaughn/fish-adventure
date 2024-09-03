import { Vector } from "../types";

const MAX_OFFSET_X = 10_000;
const MAX_OFFSET_Y = 0;
const MIN_OFFSET_X = 0;
const MIN_OFFSET_Y = 0;

let playerPosition: Vector = { x: 0, y: 0 };
let screenCoordinates: Vector = { x: 0, y: 0 };

export function getScreenCoordinates() {
  return screenCoordinates;
}

function setScreenCoordinates(value: Vector) {
  screenCoordinates = {
    x: Math.max(MIN_OFFSET_X, Math.min(MAX_OFFSET_X, value.x)),
    y: Math.max(MIN_OFFSET_Y, Math.min(MAX_OFFSET_Y, value.y)),
  };
}

// TODO Track NPC locations (and calculate collisions)

export function setPlayerPosition(value: Vector) {
  playerPosition = value;

  // TODO Enforce max x for player (assuming the map can scroll more, else allow 100%)
  // TODO Update globalOffsetX
  // TODO Calculate collisions
}
