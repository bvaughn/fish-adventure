import { MAX_OFFSET_X } from "../constants";
import { canvas } from "../main";
import {
  BACKGROUND_LAYER_1,
  BACKGROUND_LAYER_2,
  BACKGROUND_LAYER_3,
  FOREGROUND_LAYER,
  getCurrentLayer,
  handleResize,
  NPC_LAYER,
  PLAYER_LAYER,
  PLAYER_LAYER_OVERLAY,
  PLAYER_LAYER_UNDERLAY,
} from "../scheduling/drawing";
import { Rect, Size, Vector } from "../types";

export let screen: Rect = {
  height: 0,
  width: 0,
  x: 0,
  y: 0,
};

handleResize((canvas) => {
  screen.height = canvas.height;
  screen.width = canvas.width;

  // TODO Move screen if resize leaves player in an invalid position
});

export function getParallaxOffset() {
  const layer = getCurrentLayer();
  if (layer == null) {
    return 0; // Unexpected
  }

  // Higher layers move "faster" to create a parallax effect
  // Everything should move relative to the player layer though

  switch (layer) {
    case BACKGROUND_LAYER_1: {
      return screen.x * -0.1;
    }
    case BACKGROUND_LAYER_2: {
      return screen.x * -0.2;
    }
    case BACKGROUND_LAYER_3: {
      return screen.x * -0.3;
    }
    case NPC_LAYER:
    case PLAYER_LAYER:
    case PLAYER_LAYER_OVERLAY:
    case PLAYER_LAYER_UNDERLAY: {
      return -screen.x;
    }
    case FOREGROUND_LAYER: {
      return screen.x * -1.1;
    }
  }
}

export function getScreenCoordinates() {
  return screen;
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
      screen.x = Math.min(MAX_OFFSET_X, screen.x + (position.x - threshold));
    }
  } else if (velocity.x < 0) {
    const threshold = screen.x + canvas.width * 0.15;
    if (position.x <= threshold) {
      screen.x = Math.max(0, screen.x - (threshold - position.x));
    }
  }

  // TODO Update globalOffsetX
  // TODO Calculate collisions
}
