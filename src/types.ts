export type Fish = {
  // Configuration
  maxSpeed: number;
  restlessness: number;

  // Cached values
  calculatedSize: number;
  position: number;

  // State
  frameCount: number;
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
