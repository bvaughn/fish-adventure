export type Fish = {
  // Configuration
  maxSpeed: number;
  restlessness: number;

  // Cached values
  calculatedSize: number;
  position: number;

  // State
  moveTimeStart: number;
  moveTimeStop: number;
  positionStart: number;
  positionStop: number;
};

export type Fisherman = {
  // Configuration
  barSize: number;

  // Cached values
  barPosition: number;

  // State
  fishingProgress: number;
  isReeling: boolean;
  reelStartPosition: number;
  reelStartTime: number;
};
