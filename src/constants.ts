import { Fish, Fisherman } from "./types";

export const FISH_DEFAULTS: Fish = {
  calculatedSize: 0,
  maxSpeed: 0.25,
  position: 0,
  restlessness: 0.25,
  moveTimeStart: 0,
  moveTimeStop: 0,
  positionStart: 0,
  positionStop: 0,
};

export const FISHERMAN_DEFAULTS: Fisherman = {
  barSize: 0.3,
  fishingProgress: 0,
  isReeling: false,
  barPosition: 0,
  reelStartPosition: 0,
  reelStartTime: 0,
};
