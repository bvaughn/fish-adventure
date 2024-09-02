import {
  PLAYER_LAYER,
  registerDraw,
  registerPreload,
  registerSetup,
  runDraw,
  runPreload,
  runSetup,
} from "./drawing";
import { canvas } from "./main";
import { reset, schedule, start } from "./scheduler";
import { fromHex } from "./utils/drawing/Color";
import {
  AnimatedFishSpriteHelper,
  createAnimatedFishSpriteHelper,
} from "./utils/drawing/spritesheets/createAnimatedFishSpriteHelper";
import { initAnimatedNpcFishSpriteHelper } from "./utils/drawing/spritesheets/createAnimatedNpcFishSpriteHelper";
import { AnimatedSpriteHelper } from "./utils/drawing/spritesheets/createAnimatedSpriteHelper";
import { SpriteSheet } from "./utils/drawing/spritesheets/types";

const PADDING = 10;

export function showTestHarness() {
  canvas.clear();

  {
    let npcSpriteSheet: SpriteSheet;
    let playerSpriteSheet: AnimatedFishSpriteHelper;

    registerPreload(async () => {
      playerSpriteSheet = createAnimatedFishSpriteHelper({
        size: {
          width: 25,
          height: 13,
        },
        source: "/images/sprites/fish-player.gif",
      });

      initAnimatedNpcFishSpriteHelper();
    });

    registerSetup(() => {
      // ...
    });

    let animationFrameHelpers: AnimatedSpriteHelper[];

    registerSetup(() => {
      //   animationFrameHelpers = NPC_SPRITE_DIMENSIONS.map(
      //     ({ x, y, width, frames }) =>
      //       createAnimatedSpriteHelper({
      //         frames: new Array(frames)
      //           .fill(null)
      //           .map((_, frameIndex) =>
      //             npcSpriteSheet.getSpriteAtCoordinates(
      //               x + frameIndex * (width + 1),
      //               y
      //             )
      //           ),
      //         framesPerSecond: 3,
      //       })
      //   );
    });

    registerDraw((data, canvas) => {
      canvas.fill(fromHex("#008ca7"));
      canvas.rect(0, 0, canvas.width, canvas.height);

      let xPosition = 25;

      canvas.drawSprite(playerSpriteSheet.getSprite("forward", false), 25, 25);
      canvas.drawSprite(
        playerSpriteSheet.getSprite("forward", true),
        25,
        25 + playerSpriteSheet.size.height + PADDING
      );

      xPosition += playerSpriteSheet.size.width + PADDING;

      //   NPC_SPRITE_DIMENSIONS.forEach(({ x, y, width, frames }, index) => {
      //     const sprite = animationFrameHelpers[index].getFrame();
      //     canvas.drawSprite(sprite, xPosition, 25);

      //     xPosition += width + PADDING;
      //   });
    }, PLAYER_LAYER);
  }

  initScheduler();
}

async function initScheduler() {
  await runPreload();
  runSetup();
  schedule((data) => {
    runDraw(canvas, data);
  });
  reset();
  start();
}
