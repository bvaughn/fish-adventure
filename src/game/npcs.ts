//

import {
  BACKGROUND_LAYER_1,
  BACKGROUND_LAYER_2,
  BACKGROUND_LAYER_3,
  Layer,
  registerDraw,
} from "../drawing";
import { canvas } from "../main";
import { createMoveableLocation } from "../utils/createMoveableLocation";
import {
  AnimatedFishSpriteHelper,
  createAnimatedFishSpriteHelper,
} from "../utils/drawing/spritesheets/createAnimatedFishSpriteHelper";
import { random } from "../utils/random";

const PIXELS_PER_SECOND = 1_250;

export function addNPC(size: "smallest" | "small" | "regular") {
  let animatedSpriteHelper: AnimatedFishSpriteHelper;
  let layer: Layer;
  let speedMultiplier: number;

  switch (size) {
    case "regular": {
      animatedSpriteHelper = createAnimatedFishSpriteHelper({
        size: {
          width: 25,
          height: 11,
        },
        source: "/images/sprites/fish-npc-regular.gif",
      });
      layer = BACKGROUND_LAYER_3;
      speedMultiplier = 1;
      break;
    }
    case "small": {
      animatedSpriteHelper = createAnimatedFishSpriteHelper({
        size: {
          width: 18,
          height: 8,
        },
        source: "/images/sprites/fish-npc-small.gif",
      });
      layer = BACKGROUND_LAYER_2;
      speedMultiplier = 0.6;
      break;
    }
    case "smallest": {
      animatedSpriteHelper = createAnimatedFishSpriteHelper({
        size: {
          width: 10,
          height: 4,
        },
        source: "/images/sprites/fish-npc-smallest.gif",
      });
      layer = BACKGROUND_LAYER_1;
      speedMultiplier = 0.2;
      break;
    }
  }

  const minLocation = { x: 0 - animatedSpriteHelper.size.width, y: 0 };

  const rateOfBreathing = Math.round(random(35, 60));
  const breathingFrameOffset = Math.round(random(0, rateOfBreathing));

  const moveableLocation = createMoveableLocation({
    friction: 0,
    initialLocation: {
      x: random(0, canvas.width),
      y: random(0, canvas.height - animatedSpriteHelper.size.height),
    },
    initialVelocity: {
      x: random(-0.04 * speedMultiplier, -0.08 * speedMultiplier),
      y: 0,
    },
    minLocation,
    scale: PIXELS_PER_SECOND,
  });

  registerDraw((data, canvas) => {
    moveableLocation.update();

    // Bounds check
    if (moveableLocation.location.x === minLocation.x) {
      moveableLocation.velocity.x = random(-0.04, -0.08);
      moveableLocation.location.x = canvas.width;

      moveableLocation.location.y = random(
        0,
        canvas.height - animatedSpriteHelper.size.height
      );
    }

    const sprite = animatedSpriteHelper.getSprite("backward");

    canvas.drawSprite(
      sprite,
      moveableLocation.location.x,
      moveableLocation.location.y
    );
  }, layer);
}

export function initNPCs() {
  // TODO Preload
}

// import * as P5 from "p5";
// import {
//   api,
//   Layer,
//   BACKGROUND_LAYER_2,
//   BACKGROUND_LAYER_3,
//   PLAYER_LAYER_UNDERLAY,
//   registerDraw,
//   registerPreload,
//   registerSetup,
//   size,
// } from "../p5";
// import { assert } from "../utils/assert";
// import { createMoveableLocation } from "../utils/createMoveableLocation";
// import { createSpriteSheet, SpriteSheet } from "../utils/p5/createSpriteSheet";
// import { drawScaledImage } from "../utils/p5/drawScaledImage";
// import { initBubble } from "./initBubble";

// // TODO Share more code with initPlayerFish
// // Swimming, breathing, etc are all too similar to have this much duplication

// type Size = "smallest" | "small" | "regular";
// type NpcFishData = {
//   height: number;
//   image: P5.Image | null;
//   layer: Layer;
//   speedMultiplier: number;
//   spriteSheet: SpriteSheet | null;
//   width: number;
//   url: string;
// };

// const npcFishData: { [size: string]: NpcFishData } = {
//   regular: {
//     height: 11,
//     image: null,
//     layer: PLAYER_LAYER_UNDERLAY,
//     speedMultiplier: 1,
//     spriteSheet: null,
//     width: 25,
//     url: "/images/sprites/fish-npc-regular.gif",
//   },
//   small: {
//     height: 8,
//     image: null,
//     layer: BACKGROUND_LAYER_3,
//     speedMultiplier: 0.6,
//     spriteSheet: null,
//     width: 18,
//     url: "/images/sprites/fish-npc-small.gif",
//   },
//   smallest: {
//     height: 4,
//     image: null,
//     layer: BACKGROUND_LAYER_2,
//     speedMultiplier: 0.2,
//     spriteSheet: null,
//     width: 10,
//     url: "/images/sprites/fish-npc-smallest.gif",
//   },
// };

// const PIXELS_PER_SECOND = 1_500;

// registerPreload((api) => {
//   for (let size in npcFishData) {
//     const data = npcFishData[size];
//     data.image = api.loadImage(data.url);
//   }
// });

// registerSetup(() => {
//   for (let size in npcFishData) {
//     const data = npcFishData[size];
//     assert(data.image, "Sprite sheet not loaded");

//     data.spriteSheet = createSpriteSheet({
//       image: data.image,
//       spriteSize: { width: data.width, height: data.height },
//     });
//   }
// });

// export function initNpcFish(variant: Size) {
//   const fish = npcFishData[variant];

//   const minLocation = api.createVector(0 - animatedSpriteHelper.size.width * size.pixelScale, 0);

//   const rateOfBreathing = Math.round(random(35, 60));
//   const breathingFrameOffset = Math.round(random(0, rateOfBreathing));

//   const moveableLocation = createMoveableLocation({
//     api,
//     friction: 0,
//     initialLocation: api.createVector(
//       random(0, size.width),
//       random(0, size.height - animatedSpriteHelper.size.height * size.pixelScale)
//     ),
//     initialVelocity: api.createVector(
//       random(-0.04 * fish.speedMultiplier, -0.08 * fish.speedMultiplier),
//       0
//     ),
//     minLocation,
//     scale: PIXELS_PER_SECOND,
//   });

//   registerDraw(function drawFish(api) {
//     assert(fish.spriteSheet, "Sprite sheet not loaded");

//     api.push();
//     api.noStroke();

//     // Swim animation frames (if moving)
//     const frameIndex = api.frameCount % 30 < 15 ? 0 : 1;
//     const image = fish.spriteSheet.getFrame(frameIndex, 1);

//     // Simulate breathing with random bubbles every now and then
//     if ((api.frameCount + breathingFrameOffset) % rateOfBreathing === 0) {
//       let maxBubbles = 3;
//       let minIndex = 1;
//       let velocity = {
//         x: moveableLocation.velocity.x / 2,
//         y: random(-1, -0.5),
//       };

//       switch (variant) {
//         case "small": {
//           maxBubbles = 2;
//           minIndex = 2;
//           velocity.y = random(-0.6, -0.3);
//           break;
//         }
//         case "smallest": {
//           maxBubbles = 1;
//           minIndex = 3;
//           velocity.y = random(-0.4, -0.2);
//           break;
//         }
//       }

//       const numBubbles = Math.round(random(1, maxBubbles));
//       for (let i = 0; i < numBubbles; i++) {
//         let x = moveableLocation.location.x;
//         x += random(-size.pixelScale * 2, size.pixelScale * 2);

//         let y = moveableLocation.location.y;
//         y += random(-size.pixelScale * 2, size.pixelScale * 2);

//         initBubble({
//           layer: fish.layer,
//           minIndex,
//           position: { x, y },
//           velocity,
//         });
//       }
//     }

//     moveableLocation.update();

//     if (moveableLocation.location.x === minLocation.x) {
//       moveableLocation.velocity.x = random(-0.04, -0.08);
//       moveableLocation.location.x = size.width;

//       moveableLocation.location.y = random(
//         0,
//         size.height - image.height * size.pixelScale
//       );
//     }

//     drawScaledImage({
//       api,
//       image,
//       scale: size.pixelScale,
//       translateX: moveableLocation.location.x,
//       translateY: moveableLocation.location.y,
//     });

//     api.pop();
//   }, fish.layer);

//   return function destroy() {};
// }
