import { MAX_OFFSET_X, TILE_SIZE } from "../constants";
import { canvas } from "../main";
import {
  BACKGROUND_LAYER_1,
  BACKGROUND_LAYER_2,
  BACKGROUND_LAYER_3,
  FOREGROUND_LAYER,
  getCurrentLayer,
  handleResize,
  Layer,
  NPC_LAYER,
  PLAYER_LAYER,
  PLAYER_LAYER_OVERLAY,
  PLAYER_LAYER_UNDERLAY,
} from "../scheduling/rendering";
import { Rect, Size, Vector } from "../types";

export type VisibleTiles = {
  maxTile: number;
  minTile: number;
  rects: Rect[];
  xStart: number;
  xStop: number;
};

export const screen: Rect = {
  height: 0,
  width: 0,
  x: 0,
  y: 0,
};

export function getParallaxMultiplierForLayer(layer: Layer): number {
  // Higher layers move "faster" to create a parallax effect
  // Everything should move relative to the player layer though
  switch (layer) {
    case BACKGROUND_LAYER_1: {
      return -0.1;
    }
    case BACKGROUND_LAYER_2: {
      return -0.2;
    }
    case BACKGROUND_LAYER_3: {
      return -0.3;
    }
    case NPC_LAYER:
    case PLAYER_LAYER:
    case PLAYER_LAYER_OVERLAY:
    case PLAYER_LAYER_UNDERLAY: {
      return -1;
    }
    case FOREGROUND_LAYER: {
      return -1.1;
    }
    default: {
      throw Error(`Unexpected layer ${layer}`);
    }
  }
}

export function getParallaxOffset() {
  const layer = getCurrentLayer();
  if (layer == null) {
    return 0; // Unexpected
  }

  return screen.x * getParallaxMultiplierForLayer(layer);
}

export function getVisibleTilesForLayer(layer: Layer): VisibleTiles {
  const multiplier = getParallaxMultiplierForLayer(layer);

  const xStart = Math.abs(screen.x * multiplier);
  const xStop = xStart + canvas.width;

  const minTile = Math.floor(xStart / TILE_SIZE);
  const maxTile = Math.floor(xStop / TILE_SIZE);

  const rects: Rect[] = [];

  for (let index = minTile; index <= maxTile; index++) {
    rects.push({
      height: canvas.height,
      width: TILE_SIZE,
      x: TILE_SIZE * index,
      y: 0,
    });
  }

  return { minTile, maxTile, rects, xStart, xStop };
}

export function initializeSharedState() {
  screen.height = canvas.height;
  screen.width = canvas.width;

  handleResize((canvas) => {
    screen.height = canvas.height;
    screen.width = canvas.width;

    // TODO Move screen if resize leaves player in an invalid position
  });
}

// TODO Track NPC locations (and calculate collisions)

export function updatePlayerPosition(
  spriteSize: Size,
  position: Vector,
  velocity: Vector
) {
  // TODO Enforce MAX_OFFSET_X for player (and update movable helper somehow)
  // It would be nice if the player kind of bounced off the min-x/max-x (like the current was too strong)

  // Scroll the screen when the player nears either edge
  if (velocity.x > 0) {
    const threshold = screen.x - spriteSize.width + canvas.width * 0.85;
    if (position.x >= threshold) {
      screen.x = Math.round(
        Math.min(MAX_OFFSET_X, screen.x + (position.x - threshold))
      );
    }
  } else if (velocity.x < 0) {
    const threshold = screen.x + canvas.width * 0.15;
    if (position.x <= threshold) {
      screen.x = Math.round(Math.max(0, screen.x - (threshold - position.x)));
    }
  }
}
