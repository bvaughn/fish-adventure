import { Fish, Fisherman } from "./types";

export const FISH_DEFAULTS: Fish = {
  calculatedSize: 0,
  maxSpeed: 0.25,
  position: 0,
  restlessness: 0.25,
  frameCount: 0,
};

export const FISHERMAN_DEFAULTS: Fisherman = {
  barSize: 0.25,
  fishingProgress: 0.2,
  isReeling: false,
  barPosition: 0,
  reelStartPosition: 0,
  reelStartTime: 0,
};
